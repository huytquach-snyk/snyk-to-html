import { exec } from 'child_process';
import path = require('path');
import { test } from 'tap';
import { SnykToHtml } from '../src/lib/snyk-to-html';

const summaryOnly = true;
const noSummary = false;
const remediation = true;
const noRemediation = false;
const main = '.'.replace(/\//g, path.sep);

test('test calling snyk-to-html from command line', (t) => {
  t.plan(1);
  exec(
    `node ${main} -i ./test/fixtures/multi-test-report.json`,
    { maxBuffer: 1024 * 1024 },
    (err) => {
      if (err) {
        throw err;
      }
      t.pass('should not throw exception');
    },
  );
});

test('test snyk-to-html handles -s argument correctly', (t) => {
  t.plan(2);
  exec(
    `node ${main} -i ./test/fixtures/test-report-with-remediation.json -s`,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.doesNotHave(
        cleanedReport,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.matchSnapshot(
        cleanedReport,
        'should be expected snapshot containing summary template',
      );
    },
  );
});

test('test snyk-to-html handles -a argument correctly', (t) => {
  t.plan(2);
  exec(
    `node ${main} -i ./test/fixtures/test-report-with-remediation.json -a`,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.contains(
        cleanedReport,
        '<body class="test-remediation-section-projects">',
        'should contain remediation section',
      );
      t.matchSnapshot(
        cleanedReport,
        'should be expected snapshot containing actionable remediations',
      );
    },
  );
});

test('test snyk-to-html shows remediation with pins', (t) => {
  t.plan(3);
  exec(
    `node ${main} -i ./test/fixtures/test-report-with-pins-remediation.json --actionable-remediation`,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.contains(
        cleanedReport,
        '<body class="test-remediation-section-projects">',
        'should contain remediation section',
      );
      t.contains(
        cleanedReport,
        "<div class='remediation-card__pane shown test-remediation-pins'",
        'should contain pins remediation section',
      );
      t.matchSnapshot(
        cleanedReport,
        'should be expected snapshot containing actionable remediation',
      );
    },
  );
});

test('test snyk-to-html shows remediation & summary', (t) => {
  t.plan(4);
  exec(
    `node ${main} -i ./test/fixtures/test-report-with-pins-remediation.json --actionable-remediation --summary`,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.doesNotHave(
        cleanedReport,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.contains(
        cleanedReport,
        '<body class="test-remediation-section-projects">',
        'should contain remediation section',
      );
      t.contains(
        cleanedReport,
        "<div class='remediation-card__pane shown test-remediation-pins'",
        'should contain pins remediation section',
      );
      t.matchSnapshot(
        cleanedReport,
        'should be expected snapshot containing actionable remediations',
      );
    },
  );
});

test('all-around test', (t) => {
  t.plan(5);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Cross-site Scripting (XSS)</h2>',
        'should contain Cross-site Scripting (XSS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (DoS)</h2>',
        'should contain Regular Expression Denial of Service (DoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 id="overview">Overview</h2>',
        'should contain overview of the vulnerability',
      );
      t.contains(
        report,
        '<h2 id="details">Details</h2>',
        'should contain description of the vulnerability',
      );
    },
  );
});

test('multi-report test', (t) => {
  t.plan(7);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'multi-test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        '<div class="meta-count"><span>139 vulnerable dependency paths</span></div>',
        'should contain number of vulnerable dependency paths',
      );
      t.contains(
        report,
        '<h2 class="card__title">Access Restriction Bypass</h2>',
        'should contain Access Restriction Bypass vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Cross-site Scripting (XSS)</h2>',
        'should contain Cross-site Scripting (XSS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (DoS)</h2>',
        'should contain Regular Expression Denial of Service (DoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 id="overview">Overview</h2>',
        'should contain overview of the vulnerability',
      );
      t.contains(
        report,
        '<h2 id="details">Details</h2>',
        'should contain description of the vulnerability',
      );
    },
  );
});

test('multi-report test with summary only', (t) => {
  t.plan(7);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'multi-test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      t.contains(
        report,
        '<div class="meta-count"><span>139 vulnerable dependency paths</span></div>',
        'should contain number of vulnerable dependency paths',
      );
      t.contains(
        report,
        '<h2 class="card__title">Access Restriction Bypass</h2>',
        'should contain Access Restriction Bypass vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Cross-site Scripting (XSS)</h2>',
        'should contain Cross-site Scripting (XSS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (DoS)</h2>',
        'should contain Regular Expression Denial of Service (DoS) vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="details">Details</h2>',
        'does not contain details of the vulnerability',
      );
    },
  );
});

test('test with remediations arg and data containing remediations object', (t) => {
  t.plan(4);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report-with-remediation.json'),
    remediation,
    path.join(__dirname, '..', 'template', 'remediation-report.hbs'),
    summaryOnly,
    (report) => {
      // can see actionable remediation
      t.contains(
        report,
        '<body class="test-remediation-section-projects">',
        'should contain remediation section',
      );
      t.contains(
        report,
        '.remediation-card',
        'should contain remediation partial',
      );
      t.contains(
        report,
        '.remediation-card__layout-container',
        'should contain remediation tabs',
      );
      t.contains(
        report,
        '.remediation-card__pane',
        'should contain individual remediations',
      );
    },
  );
});

test('snyk-to-html run with remediation arg, some remediations and some vulns does not display vulns', (t) => {
  t.plan(4);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report-with-remediation.json'),
    remediation,
    path.join(__dirname, '..', 'template', 'remediation-report.hbs'),
    summaryOnly,
    (report) => {
      // no actionable remediations displayed
      t.match(report, 'remediation-card', 'should contain remediation section');
      t.match(
        report,
        'remediation-card__block',
        'should contain at least one remediation card',
      );
      t.notMatch(report, 'class="card card--vuln"', 'should not display vulns');
      t.notMatch(
        report,
        '<h2>No known vulnerabilities detected.</h2>',
        'should not display "no vulns" message',
      );
    },
  );
});

test('snyk-to-html run with remediation arg, no remediations and some vulns displays vulns', (t) => {
  t.plan(2);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'multi-test-report.json'),
    remediation,
    path.join(__dirname, '..', 'template', 'remediation-report.hbs'),
    summaryOnly,
    (report) => {
      // no actionable remediations displayed
      t.notMatch(
        report,
        '<div class="remediation-card">',
        'should not contain remediation section',
      );
      t.contains(
        report,
        '.card--vuln',
        'should contain at least one vuln card',
      );
    },
  );
});

test('snyk-to-html run with remediation arg, no remediations or vulns displays "no vulns" message', (t) => {
  t.plan(3);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'no-vulns.json'),
    remediation,
    path.join(__dirname, '..', 'template', 'remediation-report.hbs'),
    summaryOnly,
    (report) => {
      // no actionable remediations displayed
      t.notMatch(
        report,
        '<div class="remediation-card">',
        'should not contain remediation section',
      );
      t.notMatch(
        report,
        '.div class="card card--vuln"',
        'should not contain vuln cards',
      );
      t.contains(
        report,
        'No known vulnerabilities detected',
        'should display no vulns message if none present',
      );
    },
  );
});

test('all-around test with summary only', (t) => {
  t.plan(5);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Cross-site Scripting (XSS)</h2>',
        'should contain Cross-site Scripting (XSS) vulnerability',
      );
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (DoS)</h2>',
        'should contain Regular Expression Denial of Service (DoS) vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="details">Details</h2>',
        'does not contain details of the vulnerability',
      );
    },
  );
});

test('all-around test with summary only with no remediation but having one fixedIn', (t) => {
  t.plan(4);
  SnykToHtml.run(
    path.join(
      __dirname,
      'fixtures',
      'test-report-with-no-remediation-with-one-fixed-in.json',
    ),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(report, 'Fixed in: 2.9.10', 'should say: Fixed in: 2.9.10');
      t.doesNotHave(
        report,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="details">Details</h2>',
        'does not contain details of the vulnerability',
      );
    },
  );
});

test('all-around test with summary only with no remediation but having multiple fixedIn', (t) => {
  t.plan(4);
  SnykToHtml.run(
    path.join(
      __dirname,
      'fixtures',
      'test-report-with-no-remediation-with-multiple-fixed-in.json',
    ),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        'Fixed in: 2.9.10, 4.5.6',
        'should say: Fixed in: 2.9.10, 4.5.6',
      );
      t.doesNotHave(
        report,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="details">Details</h2>',
        'does not contain details of the vulnerability',
      );
    },
  );
});

test('all-around test with summary only with no remediation and no fixedIns', (t) => {
  t.plan(4);
  SnykToHtml.run(
    path.join(
      __dirname,
      'fixtures',
      'test-report-with-no-remediation-and-no-fixed-in.json',
    ),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">Regular Expression Denial of Service (ReDoS)</h2>',
        'should contain Regular Expression Denial of Service (ReDoS) vulnerability',
      );
      t.contains(
        report,
        'There is no remediation at the moment',
        'should say There is no remediation at the moment',
      );
      t.doesNotHave(
        report,
        '<h2 id="overview">Overview</h2>',
        'does not contain overview of the vulnerability',
      );
      t.doesNotHave(
        report,
        '<h2 id="details">Details</h2>',
        'does not contain details of the vulnerability',
      );
    },
  );
});

test('empty values test (description and info)', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report-empty-descr.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        '<p>No description available.</p>',
        'should contain "No description available"',
      );
    },
  );
});

test('should not generate report for invalid json', (t) => {
  t.plan(0);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'invalid-input.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.match(report, '', 'report object is empty');
    },
  );
});

test('template output displays vulns in descending order of severity ', (t) => {
  SnykToHtml.run(
    path.join(
      __dirname,
      'fixtures',
      'test-report-with-critical-severity-vuln.json',
    ),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    summaryOnly,
    (report) => {
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(report);

      // Asserting presence using CSS classname :grimace:
      // check each severity combination
      const orderScenarios = [
        cleanedReport.indexOf(`data-snyk-test="critical"`) <
          cleanedReport.indexOf(`data-snyk-test="high"`),
        cleanedReport.indexOf(`data-snyk-test="high"`) <
          cleanedReport.indexOf(`data-snyk-test="medium"`),
        cleanedReport.indexOf(`data-snyk-test="medium"`) <
          cleanedReport.indexOf(`data-snyk-test="low"`),
      ];

      orderScenarios.forEach((orderAsExpected) => {
        t.equal(orderAsExpected, true, 'vulns appear in correct order');
      });

      // compares against snapshot in tap-snapshots/test-snyk-to-html.test.ts-TAP.test.js
      // to re-generate snapshots: tap test.js --snapshot
      t.matchSnapshot(cleanedReport, 'should be expected snapshot');
      t.end();
    },
  );
});

test('no vulnerabilities and no remediation', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'no-vulns.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        'No known vulnerabilities detected.',
        'should contain "No known vulnerabilities detected."',
      );
    },
  );
});

test('no vulnerabilities with remediation', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'no-vulns.json'),
    remediation,
    path.join(__dirname, '..', 'template', 'remediation-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        'No known vulnerabilities detected.',
        'should contain "No known vulnerabilities detected."',
      );
    },
  );
});

test('displays metatable when metatable data present', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report-with-remediation.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        '<table class="metatable">',
        'should contain metatable',
      );
    },
  );
});

test('does not display metatable when no metatable data present', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-report.hbs'),
    noSummary,
    (report) => {
      t.doesNotHave(
        report,
        '<table class="metatable">',
        'should not contain metatable',
      );
    },
  );
});

test('cve report summary does not display license issues', (t) => {
  t.plan(1);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures', 'multi-test-report.json'),
    noRemediation,
    path.join(__dirname, '..', 'template', 'test-cve-report.hbs'),
    noSummary,
    (report) => {
      t.doesNotHave(
        report,
        '<div class="divTableCell"><a href="https://snyk.io/vuln/snyk:lic',
        'should not contain links to license issues',
      );
    },
  );
});

test('IaC input - test calling snyk-to-html from command line', (t) => {
  t.plan(1);
  exec(
    `node ${main} -i ./test/fixtures/iac-test-report.json`,
    { maxBuffer: 1024 * 1024 },
    (err) => {
      if (err) {
        throw err;
      }
      t.pass('should not throw exception');
    },
  );
});

test('IaC input - test snyk-to-html handles -s argument correctly', (t) => {
  t.plan(4);
  exec(
    `node ${main} -i ./test/fixtures/iac-test-report.json -s`,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.doesNotHave(
        cleanedReport,
        '<h2>Impact</h2>',
        'does not contain impact of the issue',
      );
      t.doesNotHave(
        cleanedReport,
        '<h2>Remediation</h2>',
        'does not contain remediation of the issue',
      );
      t.doesNotHave(
        cleanedReport,
        '<h2>References</h2>',
        'does not contain references of the issue',
      );
      t.matchSnapshot(
        cleanedReport,
        'should be expected snapshot containing summary template',
      );
    },
  );
});

test('IaC input - all-around test', (t) => {
  t.plan(5);
  SnykToHtml.run(
    path.join(__dirname, 'fixtures/iac-test-report.json'),
    noRemediation,
    path.join(__dirname, '../template/iac/test-report.hbs'),
    noSummary,
    (report) => {
      t.contains(
        report,
        '<h2 class="card__title">App Service allows FTP deployments</h2>',
        'should contain App Service allows FTP deployments issue',
      );
      t.contains(
        report,
        '<h2>Impact</h2>',
        'should contain the impact of the issue',
      );
      t.contains(
        report,
        '<a href="https://snyk.io/security-rules/SNYK-CC-AZURE-533">More about this issue</a>',
        'should contain a link to the security rules site',
      );
      t.contains(
        report,
        '<a href="https://snyk.io/security-rules/SNYK-CC-AZURE-533">SNYK-CC-AZURE-533</a>',
        'should contain public ID of the issue',
      );
      t.contains(
        report,
        'Line number: 109',
        'should contain the line number of the issue',
      );
    },
  );
});

test('Code input - OpenRefine test', (t) => {
  t.plan(5);
  exec(
    `node ${main} -i ./test/fixtures/test-code-openrefine.json `,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.contains(
        cleanedReport,
        '<strong>12</strong> high issues',
        'should contain 12 high severity',
      );
      t.contains(
        cleanedReport,
        '<strong>14</strong> medium issues',
        'should contain 14 medium severity',
      );
      t.contains(
        cleanedReport,
        '<li class="card__meta__item">CWE-23</li>',
        'should contain CWE-23',
      );
      t.contains(
        cleanedReport,
        'Unsanitized input from a zip file flows into java.io.FileOutputStream, where it is used as a path. This may result in a Path Traversal vulnerability and allow an attacker to write to arbitrary files.',
        'should contain details of CWE-23',
      );
      t.contains(cleanedReport, 'dataflow', 'should contain data flow');
    },
  );
});

test('Code input - AltoroJ', (t) => {
  t.plan(5);
  exec(
    `node ${main} -i ./test/fixtures/test-code-altoroj.json `,
    (err, stdout) => {
      if (err) {
        throw err;
      }
      const regex = /<p class="timestamp">.*<\/p>/g;
      const cleanTimestamp = (rep) =>
        rep.replace(regex, '<p class="timestamp">TIMESTAMP</p>');
      const cleanedReport = cleanTimestamp(stdout);
      t.contains(
        cleanedReport,
        '<strong>14</strong> high issues',
        'should contain 14 high severity',
      );
      t.contains(
        cleanedReport,
        '<strong>5</strong> medium issues',
        'should contain 5 medium severity',
      );
      t.contains(
        cleanedReport,
        '<li class="card__meta__item">CWE-79</li>',
        'should contain CWE-79',
      );
      t.contains(
        cleanedReport,
        'Unsanitized input from an HTTP header flows into executeQuery, where it is used in an SQL query. This may result in an SQL Injection vulnerability.',
        'should contain details of SQL-Injection',
      );
      t.contains(
        cleanedReport,
        'OperationsUtil.java',
        'should contain find file reference OperationsUtil.java',
      );
    },
  );
});
