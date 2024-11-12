import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, id }) => (
  <div style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
    <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
    <div>
      <label htmlFor="text">
        T<sub>{id.split('_')[1]}</sub>
      </label>
      <input
        id="text"
        name="text"
        onChange={(event) => data.onChangeTi(event, id)}
        value={data.Ti}
        placeholder="średni czas pracy do awarii"
        className="nodrag"
      />
    </div>
    <div>
      <label htmlFor="text">
        T<sub>n{id.split('_')[1]}</sub>
      </label>
      <input
        id="text"
        name="text"
        onChange={(event) => data.onChangeTni(event, id)}
        value={data.Tni}
        placeholder="średni czas naprawy"
        className="nodrag"
      />
    </div>
    <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
  </div>
);

export default CustomNode;
