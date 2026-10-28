"""Static, dependency-light checks for the local Quantix BTP prototype."""

from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.label_targets = []
        self.local_assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "label" and attrs.get("for"):
            self.label_targets.append(attrs["for"])
        source_key = "src" if tag == "script" else "href" if tag == "link" else None
        if source_key and attrs.get(source_key):
            self.local_assets.append(attrs[source_key])


class ProjectChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html_source = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.app_source = (ROOT / "src/app.js").read_text(encoding="utf-8")
        cls.calc_source = (ROOT / "src/quote-calculations.js").read_text(encoding="utf-8")
        cls.css_source = (ROOT / "src/styles.css").read_text(encoding="utf-8")
        cls.export_source = (ROOT / "src/quote-exports.js").read_text(encoding="utf-8")
        cls.document = Document()
        cls.document.feed(cls.html_source)
        metadata_source = (ROOT / "src/phone-countries.js").read_text(encoding="utf-8")
        cls.phone_data = json.loads(re.search(
            r"window\.QUANTIX_PHONE_COUNTRIES\s*=\s*(\[.*\]);\s*$",
            metadata_source,
            re.S,
        ).group(1))

    def test_html_has_unique_ids_and_local_assets(self):
        self.assertEqual(len(self.document.ids), len(set(self.document.ids)))
        self.assertTrue(set(self.document.label_targets).issubset(self.document.ids))
        for asset in self.document.local_assets:
            self.assertFalse(asset.startswith(("http:", "https:", "//")))
            self.assertTrue((ROOT / asset).is_file(), asset)
        self.assertIn("./src/quote-calculations.js", self.document.local_assets)
        self.assertIn("./src/quote-catalog.js", self.document.local_assets)
        self.assertNotIn("site-footer", self.html_source)

    def test_dynamic_form_labels_target_existing_control_ids(self):
        controls = set(re.findall(r"<(?:input|select|textarea)\b[^>]*\bid=\"([^\"]+)\"", self.app_source))
        labels = re.findall(r"<label\b[^>]*\bfor=\"([^\"]+)\"", self.app_source)
        self.assertTrue(labels)
        self.assertTrue(set(labels).issubset(controls), sorted(set(labels) - controls))

    def test_runtime_sources_do_not_request_network_resources(self):
        runtime = self.app_source + self.calc_source + self.css_source + self.export_source + (ROOT / "src/phone-countries.js").read_text(encoding="utf-8") + (ROOT / "src/quote-catalog.js").read_text(encoding="utf-8") + (ROOT / "src/quote-storage.js").read_text(encoding="utf-8")
        runtime_without_comments = re.sub(r"/\*.*?\*/|//[^\n]*", "", runtime, flags=re.S)
        self.assertNotRegex(runtime_without_comments, r"(?i)https?://|@import\s+url\(")
        self.assertNotRegex(runtime_without_comments, r"\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b")

    def test_flows_07_08_navigation_summary_and_protected_json_backup_are_present(self):
        for marker in (
            "data-top-back", "function navigateBack(destination)", "data-flow=\"QBT-FLOW-07\"",
            "data-flow=\"QBT-FLOW-08\"", "function quoteSummary()", "data-save-screen",
            "data-download-backup", "data-import-file", "replaceConfirm", "summary.sections.map", "storage.serialize(backupData()",
            "storage.deserialize(importText", "AES-256-GCM", "PBKDF2-SHA-256", "ITERATIONS = 310000",
        ):
            self.assertIn(marker, self.app_source + (ROOT / "src/quote-storage.js").read_text(encoding="utf-8"))

    def test_language_and_dark_theme_are_opt_in_and_locally_defined(self):
        self.assertIn('data-language', self.html_source)
        self.assertIn('data-theme-toggle', self.html_source)
        self.assertIn("document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light'", self.app_source)
        self.assertIn(':root[data-theme="dark"]', self.css_source)
        self.assertIn('--canvas: #172333', self.css_source)
        self.assertIn('--pink: #e25198', self.css_source)
        self.assertIn("'Clear construction budgets.'", self.app_source)

    def test_project_root_paths_match_renamed_directory(self):
        for name in (
            "AGENTS.md", "docs/CAHIER_DES_CHARGES.md", "docs/DEPENDANCES_ET_MODE_HORS_LIGNE.md",
            "docs/DECISIONS.md", "docs/CRITERES_VALIDATION.md",
        ):
            text = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn("/home/miguel/Documents/QuantixBTP", text, name)
            self.assertNotIn("/home/miguel/Documents/ChatGPT", text, name)

    def test_demo_label_and_informational_notices_share_flow02_green_style(self):
        for marker in (
            'data-home-example>Demo</button>',
            "function demoNoticeMarkup()",
            "Illustrative example · fictional data",
            "Exemple illustratif · données fictives",
            "localNoticeMarkup('Prérequis hors devis'",
            "Les études, la préparation générale du terrain et l’installation du chantier ne sont pas chiffrées par Quantix BTP.",
            'class="local-notice incomplete-confirm"',
            "Some sections are unfinished. Their current totals will not include missing costs. Continue to the summary?",
            "Certaines sections restent incomplètes. Les éléments manquants ne seront pas inclus dans le total actuel. Continuer vers la synthèse ?",
        ):
            self.assertIn(marker, self.app_source)
        self.assertIn(".local-notice { display: flex", self.css_source)
        self.assertIn("color: var(--green); background: var(--green-pale)", self.css_source)
        self.assertNotIn("background:#fff4d8", self.css_source)
        self.assertNotIn("background: #fff4dc", self.css_source)
        self.assertNotIn("background:#433922", self.css_source)
        self.assertNotIn("Voir un exemple complet", self.app_source)
        self.assertNotIn("View a complete example", self.app_source)

    def test_readable_exports_require_json_download_but_not_confirmation_checkbox(self):
        for marker in ("data-export-csv", "data-export-xlsx", "data-export-pdf", "updateExportAvailability", "buildCsv", "buildXlsx", "buildPdf", "downloadBlob"):
            self.assertIn(marker, self.app_source + self.export_source + self.css_source)
        self.assertNotIn("data-backup-attestation", self.app_source)
        self.assertNotIn("name=\"backupReady\"", self.app_source)
        self.assertNotIn("window.print()", self.app_source)
        self.assertIn("./src/quote-exports.js", self.document.local_assets)
        self.assertIn("Les exports CSV, XLSX et PDF sont des fichiers de lecture non chiffrés.", self.app_source)


    def test_current_user_requests_are_present_and_summary_rows_are_section_grouped(self):
        self.assertIn("phone.value = ''; contributor.phone = ''", self.app_source)
        self.assertIn("grid-template-columns: 136px minmax(0, 1fr)", self.css_source)
        self.assertIn('data-home-import', self.app_source)
        self.assertIn("storage.deserialize(raw, password)", self.app_source)
        self.assertIn('data-resume-stage', self.app_source)
        self.assertIn('detourReturnPending', self.app_source)
        self.assertIn('data-continue-incomplete', self.app_source)
        self.assertIn('data-all-available', self.app_source)
        self.assertIn('equipmentOnlyTerms', self.app_source)
        self.assertIn('equipmentSplits', (ROOT / "src/quote-catalog.js").read_text(encoding="utf-8"))
        self.assertIn('jour-personne', self.app_source)
        self.assertIn('data-remove-equipment', self.app_source)
        self.assertIn('data-remove-line', self.app_source)
        self.assertNotIn('<th>Section</th>', self.app_source)
        self.assertNotIn('row.section', self.app_source)
        self.assertNotIn('<aside class="model-notice', self.app_source)
        self.assertIn('Définissez votre projet', self.app_source)
        self.assertIn('data-export-pdf disabled>Télécharger le PDF', self.app_source)
        self.assertIn("language === 'en' ? 'backup' : 'sauvegarde'", self.app_source)
        self.assertIn("language === 'en' ? 'estimate' : 'devis'", self.app_source)
        self.assertIn('data-new-estimate', self.app_source)
        self.assertIn("+ Nouveau devis", self.app_source)
        self.assertIn('Start a new estimate and clear all current estimate data?', self.app_source)
        self.assertIn('data-home-example', self.app_source)
        self.assertIn('quantix-example-en', self.html_source)
        self.assertIn('quantix-example-fr', self.html_source)
        self.assertIn('data-digits-only', self.app_source)
        self.assertIn('field.value = field.value.replace(/[^0-9]/g, \'\')', self.app_source)
        self.assertIn('function displayDesignation(value)', self.app_source)
        self.assertIn('renderSummaryCharts(summary)', self.app_source)
        self.assertIn('exportsApi.chartData(summary, language)', self.app_source)
        self.assertIn("contingency * amount / subtotal", self.export_source)
        self.assertIn('::file-selector-button', self.css_source)
        self.assertIn(':root[data-theme="dark"] .resource-row,', self.css_source)
        self.assertNotIn('<p class="eyebrow">QBT-FLOW-07', self.app_source)
        self.assertNotIn('<p class="eyebrow">QBT-FLOW-08', self.app_source)
        self.assertNotIn('quote.sections[0].toConfirm.map', self.app_source)
        self.assertNotIn('class="catalog-description"', self.app_source)
        self.assertNotIn('section.description ?', self.app_source)
        for path in (ROOT / 'examples/quantix-exemple-fr.json', ROOT / 'examples/quantix-example-en.json'):
            self.assertTrue(path.is_file())
            fixture = json.loads(path.read_text(encoding='utf-8'))
            self.assertEqual(fixture['format'], 'quantix-btp-backup')
            self.assertEqual(fixture['version'], 1)
            self.assertIn('data', fixture)
            self.assertIn('quote', fixture['data'])
            self.assertEqual(fixture['data']['project']['currency'], 'XAF')
            self.assertEqual(fixture['demo']['quantity'], '12')
            self.assertEqual(fixture['demo']['equipmentQuantity'], '2')
        for locale, filename in [('fr', 'quantix-exemple-fr.json'), ('en', 'quantix-example-en.json')]:
            fixture = json.loads((ROOT / 'examples' / filename).read_text(encoding='utf-8'))
            embedded = re.search(rf'<script id="quantix-example-{locale}" type="application/json">(.*?)</script>', self.html_source)
            self.assertIsNotNone(embedded)
            self.assertEqual(json.loads(embedded.group(1)), fixture)
        self.assertIn("selectedIndex === 0 ? { plans: 'yes', sitePrep: 'yes', siteSetup: 'yes' } : { previousStage: 'yes' }", self.app_source)

    def test_css_has_no_parser_errors_when_tinycss2_is_available(self):
        try:
            import tinycss2
        except ImportError:
            self.skipTest("tinycss2 absent; CSS parser check not available")
        nodes = tinycss2.parse_stylesheet(self.css_source, skip_comments=True, skip_whitespace=True)
        self.assertFalse([node for node in nodes if node.type == "error"])
        self.assertIn("+ 2px", self.css_source)
        self.assertIn(".project-fields .field label { font-size: calc(1em + 2px); }", self.css_source)
        self.assertNotIn("site-footer", self.css_source)

    def test_flow03_fields_currency_building_types_and_green_notice(self):
        for marker in (
            'data-flow="QBT-FLOW-03"',
            'name="location"',
            'name="notes"',
            'name="buildingTypeOther"',
            '<option value="USD">Dollar américain (USD)</option>',
            '<option value="EUR">Euro (EUR)</option>',
            '<option value="JPY">Yen japonais (JPY)</option>',
            '<option value="GBP">Livre sterling (GBP)</option>',
            "Entrepôt / bâtiment industriel",
            "Précisez le type de bâtiment.",
            "background: var(--green-pale)",
        ):
            self.assertIn(marker, self.app_source + self.css_source)
        self.assertIn("selected.value === 'Autre'", self.app_source)
        building_catalog = self.app_source.split("const buildings = [", 1)[1].split("  ];", 1)[0]
        self.assertEqual(len(re.findall(r"\['([^']+)',", building_catalog)), 8)

    def test_flow04_keeps_five_stage_options_and_user_facing_subtitle(self):
        stage_catalog = self.app_source.split("const stages = [", 1)[1].split("  ];", 1)[0]
        stage_names = re.findall(r"\['([^']+)',", stage_catalog)
        self.assertEqual(stage_names, [
            "Fondations et infrastructure",
            "Soubassement et plancher bas",
            "Élévation du rez-de-chaussée",
            "Plancher et niveaux supérieurs",
            "Charpente et couverture",
        ])
        self.assertIn("Choisissez l’étape des travaux que vous souhaitez estimer.", self.app_source)
        self.assertNotIn("Les étapes exclues du devis n’apparaissent pas dans la liste.", self.app_source)

    def test_flow05_checks_three_foundation_prerequisites_or_only_previous_stage(self):
        for marker in (
            'data-flow="QBT-FLOW-05"',
            "['plans', 'Études et plans disponibles']",
            "['sitePrep', 'Préparation du terrain terminée']",
            "['siteSetup', 'Installation du chantier réalisée']",
            "stages[selectedIndex - 1]",
            "stageCheck.answers",
            "Vous pouvez poursuivre.",
            "visitPreviousQuote",
            "resumeStage",
            "detourReturnPending",
            "Répondez à chaque question pour continuer.",
        ):
            self.assertIn(marker, self.app_source)
        self.assertIn("Indiquez si l’étape précédente a déjà été réalisée.", self.app_source)
        self.assertNotIn("Indiquez l’état de l’étape directement précédente.", self.app_source)

    def test_flow06_calculation_rules_and_manual_unit_path_are_explicit(self):
        for marker in (
            'data-flow="QBT-FLOW-06"',
            "Parpaing creux",
            "Parpaing plein",
            "Bloc de terre comprimée (BTC)",
            "data-section-field=\"blockTypeOther\"",
            "unit === 'custom'",
            "mode: 'manual'",
            "contingency: 5",
            "data-save-quote",
            "quoteMath.validateQuote",
            "feedback.classList.add('is-error')",
            "scrollIntoView",
        ):
            self.assertIn(marker, self.app_source)
        self.assertIn('function renderConcreteAssistant(section)', self.app_source)
        self.assertIn('function calculateConcrete(section, form)', self.app_source)
        for marker in (
            "product([length, width, thickness], 'Dimension')",
            "Math.ceil((wallArea - openings)",
            "quantity * positive(recipe.cementKgPerM3",
            "quantity * positive(recipe.sandM3PerM3",
            "quantity * positive(recipe.gravelM3PerM3",
            "quantity * positive(recipe.waterLPerM3",
            "return amount * price",
        ):
            self.assertIn(marker, self.calc_source)

    def test_flow06_catalog_is_local_stage_specific_and_has_equipment_statuses(self):
        catalog = (ROOT / "src/quote-catalog.js").read_text(encoding="utf-8")
        for stage in (
            "Fondations et infrastructure",
            "Soubassement et plancher bas",
            "Élévation du rez-de-chaussée",
            "Plancher et niveaux supérieurs",
            "Charpente et couverture",
        ):
            self.assertIn(f"stage: '{stage}'", catalog)
            self.assertIn("id: 'equipment'", catalog)
        for marker in (
            "Déjà disponible",
            "À acheter",
            "À louer",
            "Ne sera pas utilisé",
            "applicable_a",
            "a_confirmer",
            "description_technique",
            "precisions",
            "statuts_possibles",
            "dallage-industriel",
            "Entrepôt / bâtiment industriel",
            "Ciment",
            "Sable",
            "Gravier",
            "Eau de gâchage",
        ):
            self.assertIn(marker, self.app_source + catalog)
        self.assertIn("src/quote-catalog.js", self.app_source + self.html_source)
        self.assertIn("Liste de contrôle indicative", self.app_source)
        self.assertIn("function activeMaterialItems(section)", self.app_source)
        self.assertIn("section.blockMethod", self.app_source)
        self.assertNotIn("Choisir une unité", self.app_source)
        self.assertNotIn("unité de chantier (à préciser)", self.app_source)
        self.assertIn("jour-personne", self.app_source)
        self.assertIn("data-all-available", self.app_source)

        self.assertIn("preset.applicable_a.includes(project.buildingType)", self.app_source)

    def test_flow02_email_is_lowercase_and_common_ascii_mailbox_syntax_is_checked(self):
        for marker in (
            "control.value.toLocaleLowerCase('en-US')",
            "email.value.trim().toLocaleLowerCase('en-US')",
            "function isValidEmail(value)",
            "value.length > 254",
            "local.length > 64",
            "labels.length < 2",
            "!isValidEmail(email.value)",
        ):
            self.assertIn(marker, self.app_source)

    def test_contingency_bounds_and_currency_progress_are_defined(self):
        self.assertIn("min=\"0.1\" max=\"50\" step=\"0.1\"", self.app_source)
        self.assertIn("number / 6 * 100", self.app_source)
        self.assertIn("rate <= 0 || rate > 50", self.calc_source)

    def test_country_phone_lengths_include_cameroon_nine_digits(self):
        cameroon = [row for row in self.phone_data if row["region"] == "CM"]
        self.assertEqual(len(cameroon), 1)
        self.assertEqual(cameroon[0]["code"], "+237")
        self.assertEqual(cameroon[0]["lengths"], [9])
        self.assertEqual(len({row["region"] for row in self.phone_data}), len(self.phone_data))
        self.assertTrue(all(row["lengths"] and row["code"].startswith("+") for row in self.phone_data))

    def test_original_mockups_are_unchanged(self):
        expected = {
            "quantix-maquette-ordinateur.png": "0acb46571f007a1380179d668dbbb52c6262f3ffadb38e5380cd339767a162ac",
            "quantix-maquette-mobile.png": "3b243fb39ac5aa9d3a57fe7619851681571c465a7f0fb2e3da35d856517ebc7a",
        }
        for name, digest in expected.items():
            actual = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            self.assertEqual(actual, digest, name)


if __name__ == "__main__":
    unittest.main()
