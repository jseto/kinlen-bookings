export class SampleFile {
  title:string =        "Just a sample file that you can delete"

  async testPromise( num: number ) {
    let promise = new Promise<any>( ( resolve: any ) =>{
      setTimeout( () => {
        resolve( { id: 200, date: num } );
      }, 500 );
    });
    return await promise;
  }
}
