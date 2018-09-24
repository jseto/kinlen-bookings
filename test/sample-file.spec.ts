import {SampleFile} from '../src/sample-file';

describe('Article unit tests', () => {
  it('Has correct title', () => {
    let a = new SampleFile();
    expect(a.title)
      .toBe("Just a sample file that you can delete");
  });
});
