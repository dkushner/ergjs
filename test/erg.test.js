jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('Erg', function() {
  it('loads and initializes the worker on construction', function() {
    var erg = new Erg();

    expect(erg).toBeDefined();
    expect(erg.worker).toBeDefined();

    return erg.ready.then(erg => {
      expect(erg).toBeDefined();
      expect(erg.connected).toBe(true);
    });
  });

  it('can load worker source from an indicated base path', function() {
    var erg = new Erg('base/lib');

    expect(erg).toBeDefined();
    expect(erg.worker).toBeDefined();

    return erg.ready.then(erg => {
      expect(erg).toBeDefined();
      expect(erg.connected).toBe(true);
    });
  });

  it('dispatches individual tasks for execution on worker', function() {
    var erg = new Erg();

    return erg.ready.then((erg) => {
      return erg.dispatch((context) => { 
        return context.value; 
      }, { 
        value: 999 
      });
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result).toBe(999);
    });
  });

  it('can handle object task response types', function() {
    var erg = new Erg();

    return erg.ready.then((erg) => {
      return erg.dispatch((context) => context, { 
        value: 999 
      });
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result.value).toBe(999);
    });
  });

  it('properly conveys errors in workers', function() {
    var erg = new Erg();

    return erg.dispatch((context) => {
      throw new Error("Something went wrong.");
    }).then(() =>{
      throw new Error("Something went right.");
    }).catch((err) => {
      expect(err).toBeDefined();
      expect(err).toBe("Something went wrong.");
    });
  });

  it('allows registering tasks by name for reuse', function() {
    var erg = new Erg();
    
    return erg.ready.then(() => {
      return erg.register('value', (context) => { return context.value });
    }).then(() => {
      return erg.dispatch('value', { value: 999 });
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result).toBe(999);
    });
  });
  
  it('allows for loading external script resources', function() {
    var erg = new Erg();

    return erg.ready.then(() => {
      return erg.load('base/test/dependency.js');
    }).then(() => {
      return erg.dispatch(() => TEST);
    }).then((result) => {
      expect(result).toBe("PASS");
    });
  });

  it('allows for buffer object transfers as part of context', function() {
    var erg = new Erg();

  });
});
