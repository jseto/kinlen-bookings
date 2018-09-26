import {SampleFile} from '../src/sample-file';
import {GuideBooking} from "../src/guide-booking";

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

  it( 'Should give a good answer', ()=>{
    let t: any = { id: 1, a: 3 };
    expect( t.id ).toBe( 1 );
    let a = new GuideBooking(t.id);
    expect( a.getId() ).toBe( 1 );
  });


});
