import React from "react";
import { Handle, Position } from "reactflow";
import "./CustomNode.css";
const CustomNode = ({ data, id }) => (
  <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5 }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: "#555" }}
    />
    <div>
      <div className="grid-container">
        <div className="grid-item">
          <label htmlFor="text">Nazwa</label>
        </div>
        <div className="grid-item">
          <input
            id="text"
            name="text"
            onChange={(event) => data.onChangeLabel(event, id)}
            value={data.label}
            placeholder="nazwa elementu"
            className="nodrag"
          />
        </div>
        <div className="grid-item">
          <label htmlFor="text">
            T<sub>{id.split("_")[1]}</sub>
          </label>
        </div>
        <div className="grid-item">
          <input
            id="text"
            name="text"
            onChange={(event) => {
              if (event.target.value < 0) event.target.value = 0;
              data.onChangeTi(event, id);
            }}
            type="number"
            min="0"
            value={data.Ti}
            placeholder="średni czas pracy do awarii"
            className="nodrag"
          />
        </div>
        <div className="grid-item">
          <label htmlFor="text">
            T<sub>n{id.split("_")[1]}</sub>
          </label>
        </div>
        <div className="grid-item">
          {" "}
          <input
            id="text"
            name="text"
            onChange={(event) => {
              if (event.target.value < 0) event.target.value = 0;
              data.onChangeTni(event, id);
            }}
            type="number"
            min="0"
            value={data.Tni}
            placeholder="średni czas naprawy"
            className="nodrag"
          />
        </div>
      </div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: "#555" }}
    />
  </div>
);

export default CustomNode;
