import React, { Component } from "react";
import UploadFilesService from "../../services/upload-files.service";

export default class UploadFiles extends Component {
    constructor(props) {
        super(props);
        this.selectFiles = this.selectFiles.bind(this);
        this.upload = this.upload.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);

        this.state = {
            selectedFiles: undefined,
            progressInfos: [],
            message: [],
            fileInfos: []
        };
    }

    selectFiles(event) {
        this.setState({
            progressInfos: [],
            selectedFiles: event.target.files,
        });
    }

    upload(idx, carId, file) {
        let _progressInfos = [...this.state.progressInfos];

        UploadFilesService.upload(file, carId, (event) => {
            _progressInfos[idx].percentage = Math.round((100 * event.loaded) / event.total);
            this.setState({
                _progressInfos,
            });
        })
            .then((response) => {
                this.setState((prev) => {
                    let nextMessage = [...prev.message, "Imaginea fost încărcată cu succes: " + file.name];
                    return {
                        message: nextMessage
                    };
                });

                // return UploadFilesService.getFiles();
            })
            .then((files) => {
                this.setState({
                    fileInfos: files.data,
                });
            })
            .catch(() => {
                _progressInfos[idx].percentage = 0;
                this.setState((prev) => {
                    let nextMessage = [...prev.message, "Imaginea nu a putut fi încărcată: " + file.name];
                    return {
                        progressInfos: _progressInfos,
                        message: nextMessage
                    };
                });
            });
    }

    uploadFiles() {
        const selectedFiles = this.state.selectedFiles;

        let _progressInfos = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            _progressInfos.push({ percentage: 0, fileName: selectedFiles[i].name });
        }

        this.setState(
            {
                progressInfos: _progressInfos,
                message: [],
            },
            () => {
                for (let i = 0; i < selectedFiles.length; i++) {
                    this.upload(i, 2, selectedFiles[i]);
                }
            }
        );
    }

    render() {
        const { selectedFiles, progressInfos, message, fileInfos } = this.state;

        return (
            <div>
                {progressInfos &&
                    progressInfos.map((progressInfo, index) => (
                        <div className="mb-2" key={index}>
                            <span>{progressInfo.fileName}</span>
                            <div className="progress">
                                <div
                                    className="progress-bar progress-bar-info"
                                    role="progressbar"
                                    aria-valuenow={progressInfo.percentage}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    style={{ width: progressInfo.percentage + "%" }}
                                >
                                    {progressInfo.percentage}%
                                </div>
                            </div>
                        </div>
                    ))}

                <div className="row my-3">
                    <div className="col-4">
                        <label className="btn btn-default p-0">
                            <input type="file" multiple onChange={this.selectFiles} />
                        </label>
                    </div>

                    {/*<div className="col-3">*/}
                    {/*    <button*/}
                    {/*        className="btn btn-info btn-sm"*/}
                    {/*        disabled={!selectedFiles}*/}
                    {/*        onClick={this.uploadFiles}*/}
                    {/*    >*/}
                    {/*        Încarcă imaginile*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>

                {message.length > 0 && (
                    <div className="alert alert-secondary" role="alert">
                        <ul>
                            {message.map((item, i) => {
                                return <li key={i}>{item}</li>;
                            })}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}