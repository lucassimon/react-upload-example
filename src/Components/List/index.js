import React from 'react';
import {
  Section, Column,
} from 'rbx';
import Item from './Item';

const List = ({ files, onDelete }) => (
  <Section>
    {files.valueSeq().map(file => (
      <Column.Group key={file.id}>
        <Column>
          <Item file={file} onDelete={onDelete} />
        </Column>
      </Column.Group>
    ))}
  </Section>
);


export default List;
