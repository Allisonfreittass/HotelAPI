import axios from "axios"

export const api = async (method, headers, endpoints, data) => {
    try{

        let result = await axios({
            method: method,
            headers: headers,
            url: window.location.hostname === 'localhost' ? `http://localhost:3000/${endpoints}` : "http://localhost:3000",
            data: data
        });
        return result
    } catch(e){
        console.log(e)
    }
}