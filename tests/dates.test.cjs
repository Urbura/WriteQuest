'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {shiftDay, startOfWeek, localDay} = require('../js/dates.js');
const {summary} = require('../js/journey.js');

function inTimeZones(check) {
  const original = process.env.TZ;
  try {
    for (const zone of ['America/Winnipeg', 'America/Toronto', 'America/Vancouver']) {
      process.env.TZ = zone;
      check(zone);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}

test('date-only shifts retain calendar dates across DST, leap days and year boundaries', () => {
  inTimeZones(zone => {
    for (const [day, offset, expected] of [
      ['2026-03-07', 2, '2026-03-09'],
      ['2026-10-31', 2, '2026-11-02'],
      ['2024-02-28', 1, '2024-02-29'],
      ['2024-03-01', -1, '2024-02-29'],
      ['2026-01-01', -1, '2025-12-31']
    ]) assert.equal(shiftDay(day, offset), expected, zone);
  });
});

test('Sunday-first weeks remain stable at Saturday and year boundaries', () => {
  inTimeZones(zone => {
    assert.equal(startOfWeek('2026-11-01'), '2026-11-01', zone);
    assert.equal(startOfWeek('2026-11-07'), '2026-11-01', zone);
    assert.equal(startOfWeek('2027-01-01'), '2026-12-27', zone);
  });
});

test('weekly progress and streaks switch together at the local Sunday reset, including DST', () => {
  inTimeZones(zone => {
    for (const sunday of ['2026-03-08', '2026-11-01']) {
      const saturday = shiftDay(sunday, -1);
      const checkins = {[saturday]: {drafting: 1}};
      const before = localDay(new Date(sunday + 'T03:29:59'));
      const after = localDay(new Date(sunday + 'T03:30:00'));
      assert.equal(before, saturday, zone);
      assert.equal(after, sunday, zone);
      const priorWeek = summary(checkins, before), nextWeek = summary(checkins, after);
      assert.equal(priorWeek.weekly, 1, zone);
      assert.equal(nextWeek.weekly, 0, zone);
      assert.equal(nextWeek.week[0].day, sunday, zone);
      assert.equal(nextWeek.week[6].day, shiftDay(sunday, 6), zone);
      assert.equal(priorWeek.current, 1, zone);
      assert.equal(nextWeek.current, 1, zone);
    }
  });
});
