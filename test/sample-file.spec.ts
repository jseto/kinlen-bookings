import {SampleFile} from '../src/sample-file';

describe('Playing with unit tests', () => {

  it('Has correct title', () => {
    let a = new SampleFile();
    expect(a.title)
      .toBe("Just a sample file that you can delete");
  });

  it('Promises should work fine', async ()=> {
    let a = new SampleFile();
    let ret = await a.testPromise( 200 );
    expect( ret.id ).toBe( 200 );
  });
});
