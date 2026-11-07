// Owner: B (card B-8). Pending tests (no function) are the checklist: fill them in.
describe('Auth', () => {
  it('B-1 stores only a bcrypt hash, never the plain password');
  it('B-2 rejects a missing username, a bad email or a weak password with 400 and field errors');
  it('B-2 rejects a username or email that is already taken with 409');
  it('B-3 logs in with a username or an email');
  it('B-3 answers 401 with one generic message for a wrong password');
  it('B-4 rejects an expired token with 401');
  it('B-5 answers 429 after too many login attempts');
  it('B-7 updates username and email');
  it('B-7 changes the password only when the current one is right');
});
