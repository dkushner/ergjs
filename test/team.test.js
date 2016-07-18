
describe('Team', () => {
  it('loads and initializes an entire team on construction', () => {
    const team = new Team(5);

    expect(team).to.be.ok;
    expect(team.workers).to.be.ok;
    expect(team.workers.length).to.equal(5);

    return team.ready;
  });

  it('distributes tasks over the managed workers', () => {
    const team = new Team(5);
    const numbers = new Array(25).fill().map((el, idx) => idx);

    return team.scatter(numbers, function(values) {
      return values.map(function(value) {
        return value + 1;
      });
    }).then((result) => {
      expect(result).to.be.ok;
      expect(result.length).to.equal(25);

      result.forEach((el, idx) => {
        expect(el).to.equal(idx + 1);
      });
    });
  });

  it('distributes a map operation over the managed workers', () => {
    const team = new Team(5);
    const numbers = new Array(25).fill(1);

    return team.map(numbers, function(value) {
      return value + 1;
    }).then((result) => {
      expect(result).to.be.ok;
      expect(result.length).to.equal(25);

      result.forEach((el, idx) => {
        expect(el).to.equal(2);
      });
    });
  });

  it('distributes reduce tasks over the managed workers', () => {
    const team = new Team(5);
    const numbers = new Array(25).fill(1);

    return team.reduce(numbers, function(last, value) {
      return value + last;
    }).then((result) => {
      expect(result).to.equal(25);
    });
  });
});

