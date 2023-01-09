import Select from 'react-select';

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
];

const dateInput = {
    filter: "invert(1)",
    border: "none",
    width: "100%",
    padding: "10px",
    outline: "none",
    fontWeight: "bold"
}


const CustomDatePicker = (params: any) => {

    const currentdate = new Date();
    const datetime = currentdate.getFullYear() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getDate() + "T"
        + currentdate.getHours() + ":"
        + currentdate.getMinutes();

    const selectedDateTimePicker = (val: any) => {
        params.dateTime(val)
    }
    return (
        // <Select options={options} />
        <>
            {/* <label >Start Time:</label> */}
            <input type="datetime-local" id="birthdaytime" name="birthdaytime" min={datetime} style={dateInput} onChange={(e) => { selectedDateTimePicker(e.target.value) }} />
        </>
    );
};

export default CustomDatePicker;