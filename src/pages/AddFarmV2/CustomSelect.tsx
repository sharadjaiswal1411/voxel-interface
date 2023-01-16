


const selectBox = {
    width: "100%",
    height: "35px",
    background: "black",
    color: "white",
    outline: "none",
    border: "none",

}



const CustomSelect = (params: any) => {

    const selectedPool = (val: any) => {
        params.pool(val)
    }

    return (
        // <Select options={options} />
        <>
            {/* <div style={{ display: "block" }}> */}
            {/* <label >Select Pool</label> */}

            <select name="pools" style={selectBox} onChange={(e) => { selectedPool(e.target.value) }}>
                <option value="select-pool" selected>--- Select---</option>
                <option value="0x952ffc4c47d66b454a8181f5c68b6248e18b66ec">USDC - USDT</option>
                <option value="0xebfe63ba0264ad639b3c41d2bfe1ad708f683bc8">wstETH - ETH</option>
                <option value="0xe6bcb55f45af6a2895fadbd644ced981bfa825cb">wstETH - USDC</option>
                <option value="0xa38a0165e82b7a5e8650109e9e54087a34c93020">ETH - KNC</option>
            </select>

            {/* </div> */}
        </>
    );
};

export default CustomSelect;