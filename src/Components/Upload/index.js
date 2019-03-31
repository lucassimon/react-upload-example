import React, { Component } from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import {
  Column,
  Field,
  File,
} from 'rbx';


class Upload extends Component {
  state = {}

  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return 'Arraste arquivos aqui';
    }

    if (isDragReject) {
      return 'Arquivo não suportado';
    }

    return 'Solte os arquivos aqui';
  }

  render() {
    const { onUpload } = this.props;
    return (
      <Dropzone
        accept="image/*"
        onDropAccepted={onUpload}
      >
        { ({
          getRootProps,
          getInputProps,
          isDragActive,
          isDragReject,
        }) => {
          const active = classNames({
            success: isDragActive && !isDragReject,
            danger: isDragReject,
          });

          return (
            <Column.Group centered>
              <Column size="half">
                <Field {...getRootProps()}>
                  <File align="centered" hasName boxed color={active}>
                    <File.Label>
                      <File.CTA>
                        <File.Label as="span">
                          { this.renderDragMessage(isDragActive, isDragReject) }
                        </File.Label>
                      </File.CTA>
                    </File.Label>
                    <File.Input name="file" {...getInputProps()} />
                  </File>
                </Field>
              </Column>
            </Column.Group>
          );
        }}
      </Dropzone>
    );
  }
}

export default Upload;
