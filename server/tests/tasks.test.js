// Owner: C (card C-7). Pending tests (no function) are the checklist: fill them in.
describe('Tasks', () => {
  it('C-1 rejects a missing title, bad status, bad priority or bad date with 400');
  it('C-2 strips HTML from title and description');
  it('C-3 updates only status when the body has only status');
  it('C-4 filters by status, priority and search, and sorts by createdAt or dueDate');
  it('C-5 returns counts per status and due this week');
  it("C-6 answers 404 for another user's task");
  it('C-6 answers 201 on create and 204 on delete');
});
