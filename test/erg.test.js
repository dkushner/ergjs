jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('Erg', () => {
  it('loads and initializes the worker on construction', () => {
    const erg = new Erg();

    expect(erg).toBeDefined();
    expect(erg.worker).toBeDefined();

    return erg.ready;
  });

  it('can load worker source from an indicated base path', () => {
    const erg = new Erg('base/lib');

    expect(erg).toBeDefined();
    expect(erg.worker).toBeDefined();

    return erg.ready;
  });

  it('dispatches individual tasks for execution on worker', () => {
    const erg = new Erg();

    return erg.dispatch(function(context) { 
      return context.value; 
    }, { 
      value: 999 
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result).toBe(999);
    });
  });

  it('can handle object task response types', () => {
    const erg = new Erg();

    return erg.dispatch(function(context) {
      return context
    }, { 
      value: 999 
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result.value).toBe(999);
    });
  });

  it('properly conveys errors in workers', () => {
    const erg = new Erg();

    return erg.dispatch(function(context) {
      throw new Error("Something went wrong.");
    }).then(() =>{
      throw new Error("Something went right.");
    }).catch((err) => {
      expect(err).toBeDefined();
      expect(err).toBe("Something went wrong.");
    });
  });

  it('allows registering tasks by name for reuse', () => {
    var erg = new Erg();
    
    return erg.register('value', function(context) { 
      return context.value 
    }).then(() => {
      return erg.dispatch('value', { value: 999 });
    }).then((result) => {
      expect(result).toBeDefined();
      expect(result).toBe(999);
    });
  });
  
  it('allows for loading external script resources', () => {
    var erg = new Erg();

    return erg.ready.then(function() {
      return erg.load('base/test/dependency.js');
    }).then(() => {
      return erg.dispatch(() => TEST);
    }).then((result) => {
      expect(result).toBe("PASS");
    });
  });

  it('allows for buffer object transfers as part of context', () => {
    var erg = new Erg();

    var numbers = new Uint8Array(10);

    return erg.dispatch(function(values) {
      Array.prototype.forEach.call(values, function(value, index, set) {
        set[index] = value + 1;
      });

      return values;
    }, numbers, [numbers]).then((result) => {
      expect(result).toBeDefined();
      expect(result instanceof Uint8Array).toBe(true);

      Array.prototype.forEach.call(result, (number) => {
        expect(number).toBe(1);
      });
    });
  });
});
