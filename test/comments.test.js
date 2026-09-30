import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import Comments from '../src/js/Comments.js';

const storedValues = new Map();
global.localStorage = {
  getItem(key) {
    return storedValues.get(key) ?? null;
  },
  setItem(key, value) {
    storedValues.set(key, value);
  },
};

describe('Product comments', () => {
  beforeEach(() => storedValues.clear());

  it('saves comments and retrieves them after creating a new comments instance', () => {
    const comments = new Comments('tents');
    comments.addComment('880RR', 'Easy to set up.', 'Alex');

    const reloadedComments = new Comments('tents').getComments('880RR');
    assert.equal(reloadedComments.length, 1);
    assert.equal(reloadedComments[0].content, 'Easy to set up.');
    assert.equal(reloadedComments[0].author, 'Alex');
    assert.ok(reloadedComments[0].date);
  });

  it('isolates comments by product and category', () => {
    const comments = new Comments('tents');
    comments.addComment('880RR', 'Tent comment.');
    comments.addComment('985RF', 'Different tent comment.');

    assert.equal(comments.getComments('880RR').length, 1);
    assert.equal(new Comments('backpacks').getComments('880RR').length, 0);
  });

  it('ignores blank comments and recovers from invalid saved JSON', () => {
    const comments = new Comments('tents');
    assert.equal(comments.addComment('880RR', '  '), null);
    storedValues.set('comments-tents', '{invalid json');

    assert.deepEqual(comments.getComments('880RR'), []);
  });
});