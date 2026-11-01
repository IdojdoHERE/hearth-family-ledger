import assert from 'node:assert/strict';
import {translate,localeFor,albanian,calendarDate,numberLocale} from '../lib/i18n.ts';
import {expenseCategories,amountToCents} from '../lib/expense-input.ts';
assert.equal(translate('en','Save expense'),'Save expense');
assert.equal(translate('sq','Save expense'),'Ruaj shpenzimin');
assert.equal(translate('sq',' Sign in '),' Kyçu ');
assert.equal(translate('sq','2 expenses waiting to sync'),'2 shpenzime në pritje të sinkronizimit');
assert.equal(translate('sq','1 expense waiting to sync'),'1 shpenzim në pritje të sinkronizimit');
assert.equal(translate('sq','Your name must be 2–60 characters.'),'Emri juaj: përdorni 2–60 karaktere.');
assert.equal(translate('sq','Groceries is your biggest chapter this month.'),'Ushqime dhe market është kategoria me më shumë shpenzime këtë muaj.');
assert.equal(translate('sq','3 expenses · 12,50 € total'),'3 shpenzime · gjithsej 12,50 €');
assert.match(translate('sq','Family login name, username or password is incorrect.'),/nuk është i saktë/);
for(const category of expenseCategories){assert.ok(albanian[category],category);assert.notEqual(translate('sq',category),category);}
assert.equal(expenseCategories[0],'Groceries'); // Stored identifiers remain compatible with existing records.
assert.equal(localeFor('sq'),'sq-AL');
assert.match(new Intl.DateTimeFormat(localeFor('sq'),{month:'long',timeZone:'UTC'}).format(new Date('2026-11-01')),/nëntor/i);
assert.equal(amountToCents('12,50'),1250);
assert.equal(translate('sq','Shënim personal i pandryshuar'),'Shënim personal i pandryshuar');
console.log('PASS: English/Shqip copy, dynamic counts, validation, categories, Albanian dates, decimal input and stable stored identifiers.');

assert.equal(calendarDate(new Date('2026-11-01T12:00:00'),'sq-AL',{month:'long',year:'numeric'}),'nëntor 2026');
assert.match(new Intl.NumberFormat(numberLocale('sq-AL'),{style:'currency',currency:'EUR'}).format(12.5),/12,50/);

assert.equal(translate('sq','1 expense · 12,50 € total'),'1 shpenzim · gjithsej 12,50 €');
