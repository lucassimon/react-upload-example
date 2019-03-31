import React from 'react';
import {
  Card, Media, Image, Button,
} from 'rbx';
import {
  FaTrash, FaCheckCircle, FaExclamationCircle, FaLink,
} from 'react-icons/fa';
import CircularProgressBar from 'react-circular-progressbar';

const Item = ({ file, onDelete }) => (
  <Card>
    <Card.Content>
      <Media>
        <Media.Item as="figure" align="left">
          <Image.Container as="p" size={64}>
            <Image
              alt="64x64"
              src={`${file.preview}`}
            />
          </Image.Container>
        </Media.Item>
        <Media.Item align="content">
          <strong>{ file.name }</strong>
          <p>
            { file.readableSize }
          </p>
        </Media.Item>
        <Media.Item align="right">
          <Button.Group>

            {!file.uploaded && !file.error && (
              <Button>
                <CircularProgressBar
                  styles={{
                    root: { width: 24 },
                    path: { stroke: '#7159c1' },
                  }}
                  strokeWidth={10}
                  percentage={file.progress}
                />
              </Button>
            )}

            {!!file.url && (
              <Button onClick={() => onDelete(file.id)} color="danger">
                <FaTrash />
              </Button>
            )}

            {file.uploaded && (
              <Button color="success">
                <FaCheckCircle />
              </Button>
            )}

            {file.error && (
              <Button color="warning">
                <FaExclamationCircle />
              </Button>
            )}

            {file.url && (
              <Button as="a" target="_blank" href={`http://${file.url}`} color="info">
                <FaLink />
              </Button>
            )}

          </Button.Group>
        </Media.Item>
      </Media>
    </Card.Content>
  </Card>
);

export default Item;
