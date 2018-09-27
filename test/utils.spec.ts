import {Utils} from "../src/utils"

describe( 'In Utils class', function() {

  describe( 'a valid Date', function() {
    let invalidDate = [
      '',
      '2000.00.00',
      '00-00-0000',
      '00-00-00',
      '2000/00/00',
      '2000-8-00',
      '2000-12-2'
    ];

    let validDate = '2000-00-00';


    it( 'should throw on invalid date', function() {
      invalidDate.forEach(( date )=>{
        expect( ()=>{ Utils.checkValidDate( date ) } ).toThrowError();
      });
    });

    it( 'should not throw on good date', function() {
      expect( ()=>{ Utils.checkValidDate( validDate ) } ).not.toThrow();
    });

  });

  describe( 'a date of equal month ', function() {

    it( 'shoul have the same month part', function() {
      let date = '2000-00-00';
      let differentMonth = [
        '2009-00-00',
        '2000-01-00',
      ]

      let sameMonth = [
        '2000-00-00',
        '2000-00-23'
      ]

      differentMonth.forEach(( diff )=>{
        expect( Utils.isSameMonth( date, diff ) ).toBeFalsy();
      });

      sameMonth.forEach(( same )=>{
        expect( Utils.isSameMonth( date, same ) ).toBeTruthy();
      });

    });

  });

});