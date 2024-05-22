export const generateVerificationCode = ()=>{
    // get current timestamp in milliseconds
    const timestamp = new Date().getTime().toString();

    // generate a random 2-digit number
    const randomNum = Math.floor(10+Math.random()*90);

    // combine timestamp and random number and extract last 5 digits
    let code = (timestamp+randomNum).slice(-5);
    return code;
}