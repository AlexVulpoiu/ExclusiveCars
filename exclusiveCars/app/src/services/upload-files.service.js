import http from "../http-common";
import authHeader from "./auth-header";

class UploadFilesService {
    upload(files, carId, onUploadProgress) {
        let formData = new FormData();

        formData.append("files", files);
        formData.append("carId", carId);

        console.log(formData.get("files"));

        return http.post("/api/images/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: authHeader().Authorization
            },
            onUploadProgress,
        });
    }
}

export default new UploadFilesService();