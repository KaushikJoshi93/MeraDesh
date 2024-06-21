
export default (status , message)=>{
    let err = new Error();
    err.status = status;
    err.message = message;
    return err;
}