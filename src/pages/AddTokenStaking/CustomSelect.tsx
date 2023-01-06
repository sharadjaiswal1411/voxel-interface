import { useState } from 'react';
import Select from 'react-select';



const selectBox = {
    width: "100%",
    height: "35px",
    background: "black",
    color: "white",
    outline: "none",
    border: "none",
}


const CustomSelect = (params: any) => {

    const selectedMint = (val: any) => {
        params.mint(val)
    }

    return (
        <>
            <select name="pools" style={selectBox} onChange={(e) => { selectedMint(e.target.value) }}>
                <option value="select-pool" selected>--- Select---</option>
                <option value="Mint 1">1</option>
                <option value="Mint 2">2</option>
                <option value="Mint 3">3</option>
                <option value="Mint 4">4</option>
            </select>
        </>
    );
};

const CustomSelectNew = (params: any) => {

    const selectedMint = (val: any) => {
        params.mint(val)
    }

    return (
        // <Select options={options} />
        <>
            {/* <div style={{ display: "block" }}> */}
            {/* <label >Select Pool</label> */}

            <select name="pools" style={selectBox} onChange={(e) => { selectedMint(e.target.value) }}>
                <option value="select-pool" selected>--- Select---</option>
                <option value="Mint 1">1</option>
                <option value="Mint 2">2</option>
                <option value="Mint 3">3</option>
                <option value="Mint 4">4</option>
            </select>
            {/* </div> */}
        </>
    );
};

export { CustomSelectNew, CustomSelect };