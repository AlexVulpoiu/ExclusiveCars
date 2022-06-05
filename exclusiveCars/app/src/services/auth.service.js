import axios from "axios";

const API_URL = "http://localhost:8090/api/auth/";

class AuthService {
    login(email, password) {
        return axios
            .post(API_URL + "signin", {
                email: email,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("user");
    }

    register(username, firstName, lastName, email, password, phone) {
        return axios.post(API_URL + "signup", {
            "username": username,
            "first_name": firstName,
            "last_name": lastName,
            "email": email,
            "password": password,
            "phone": phone
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
}

export default new AuthService();
