import React, { Component } from 'react';
import { OrderedMap } from 'immutable';
import { uniqueId } from 'lodash';
import filesize from 'filesize';
import slugify from 'slugify';
import 'rbx/index.css';
import 'react-circular-progressbar/dist/styles.css';
import { Section } from 'rbx';

import api from './services/api';
import Upload from './Components/Upload';
import List from './Components/List';

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
    api.get(`/images/${page}/${perPage}`, {
      onDownloadProgress: (e) => {
        const currentProgress = parseInt(Math.floor((e.loaded * 100) / e.total), 10);

      },
    })
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
        console.log(err)
      });
  }

  handleUpload = (handleFiles) => {
    const uploadedFiles = new OrderedMap(
      handleFiles.map((file) => {
        const id = uniqueId();
        return [id, {
          file,
          id,
          name: slugify(file.name.toLowerCase()),
          readableSize: filesize(file.size),
          preview: URL.createObjectURL(file),
          progress: 0,
          uploaded: false,
          error: false,
          url: null,
        }];
      }),
    );

    this.setState(
      ({ files }) => ({ files: files.merge(uploadedFiles) }),
      () => {
        uploadedFiles.valueSeq().toArray().forEach(this.processUpload);
      },
    );
  }

  processUpload = (uploadedFile) => {
    const data = new FormData();
    data.append('file', uploadedFile.file, uploadedFile.name);

    api.post('/images', data, {
      onUploadProgress: (e) => {
        const currentProgress = parseInt(Math.round((e.loaded * 100) / e.total), 10);
        this.setState(
          ({ files }) => ({
            files: files.update(
              uploadedFile.id, state => ({ ...state, progress: currentProgress }),
            ),
          }),
        );
      },
    })
      .then((response) => {
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
      })
      .catch(() => {
        this.setState(
          ({ files }) => ({
            files: files.update(uploadedFile.id, state => ({ ...state, error: true })),
          }),
        );
      });
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
