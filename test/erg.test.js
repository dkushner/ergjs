jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('Erg', function() {
  it('loads and initializes the worker on construction', function(done) {
    var erg = new Erg('base/lib');

    expect(erg).toBeDefined();
    expect(erg.worker).toBeDefined();

    erg.ready.then(done, done);
  });

  it('dispatches individual tasks for execution on worker', function(done) {
    var erg = new Erg('base/lib');

    erg.dispatch((context) => { 
      return context.value; 
    }, { 
      value: 999 
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result).toBe(999);
      done();
    }).catch(done);
  });
});
