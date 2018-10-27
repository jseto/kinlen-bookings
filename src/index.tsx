import { BookingMapper } from "./booking-mapper";
import * as React from "react";
import * as DatePicker from "react-datepicker";
import * as moment from "moment";

//import 'react-datepicker/dist/react-datepicker.css';

class BookingDatePicker extends React.Component {
	constructor (props) {
    super(props)
    this.state = {
      startDate: moment()
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(date) {
    this.setState({
      startDate: date
    });
  }

	getDisabledDays():[] {
		let booking = new BookingMapper(1);
		let days = [];
		for ( let i=1; i<32; ++i ) {
			if( !booking.availableSeats('2005-10-1', '' ) ) {
				days.push( moment('2005-10-01') );
			}
		}
		return [];
	}

  render() {
    return <DatePicker
        selected={this.state['startDate']}
        onChange={this.handleChange}
    />;
  }

}
