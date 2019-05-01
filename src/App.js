import React, { Component } from 'react';
import { OrderedMap } from 'immutable';
import uuid from 'uuidv4';
import filesize from 'filesize';
import slugify from 'slugify';
import 'rbx/index.css';
import 'react-circular-progressbar/dist/styles.css';
import { Section } from 'rbx';

import api from './services/api';
import Upload from './Components/Upload';
import List from './Components/List';

const calculateProgress = evt => (
  parseInt(Math.round((evt.loaded * 100) / evt.total), 10));

const getPayloadData = (file) => {
  const data = new FormData();
  data.append('file', file.file, file.name);
  return data;
};

const getFilesMap = acceptedFiles => (
  OrderedMap(acceptedFiles.map((file) => {
    const id = uuid();
    const data = {
      file,
      id,
      name: slugify(file.name.toLowerCase()),
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    };
    return [id, data];
  })));


class App extends Component {
  state = {
    files: OrderedMap(),
  }

  componentDidMount() {
    this.fetchImages(1, 10);
  }

  componentWillUnmount() {
    const { files } = this.state;
    files.valueSeq().toArray().forEach(file => URL.revokeObjectURL(file.preview));
  }

  fetchImages = (page, perPage) => {
    api.get(`/images/${page}/${perPage}`)
      .then((response) => {
        const { data } = response.data;
        const uploadedFiles = new OrderedMap(
          data.map(file => ([
            file._id,
            {
              id: file._id,
              name: file.name,
              readableSize: filesize(file.size),
              preview: `http://${file.url}`,
              uploaded: true,
              url: file.url,
            },
          ])),
        );
        this.setState(
          ({ files }) => ({ files: uploadedFiles }),
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleUpload = (handleFiles) => {
    const uploadedFiles = getFilesMap(handleFiles);

    this.setState(
      ({ files }) => ({ files: files.merge(uploadedFiles) }),
      () => {
        uploadedFiles.valueSeq().toArray().forEach(this.processUpload);
      },
    );
  }

  processUpload = (uploadedFile) => {
    const onUploadProgress = (e) => {
      this.setState(
        ({ files }) => ({
          files: files.update(
            uploadedFile.id, state => ({ ...state, progress: calculateProgress(e) }),
          ),
        }),
      );
    };

    const onUploadDone = (response) => {
      this.setState(
        ({ files }) => ({
          files: files.update(
            uploadedFile.id,
            state => ({
              ...state,
              uploaded: true,
              id: response.data._id,
              url: response.data.url,
            }),
          ),
        }),
      );
    };

    const onUploadError = () => {
      this.setState(
        ({ files }) => ({
          files: files.update(uploadedFile.id, state => ({ ...state, error: true })),
        }),
      );
    };

    api.post('/images', getPayloadData(uploadedFile), { onUploadProgress })
      .then(onUploadDone)
      .catch(onUploadError);
  }

  handleDelete = (id) => {
    api.delete(`/images/${id}`)
      .then(() => {
        // this.fetchImages(1, 10);
        this.setState(
          ({ files }) => ({ files: files.delete(id) }),
        );
      })
      .catch(err => console.log(err));
  };

  render() {
    const { files } = this.state;
    return (
      <>
        <Section>
          <Upload onUpload={this.handleUpload} />
        </Section>

        <Section>
          { files.size > 0 ? <List files={files} onDelete={this.handleDelete} /> : null }
        </Section>
      </>
    );
  }
}

export default App;
