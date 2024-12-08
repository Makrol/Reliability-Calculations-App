import React from "react";
import { Handle, Position } from "reactflow";
import "./CustomNode.css";
const CustomNodeKZN = ({ data, id }) => (
  <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5 }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: "#555" }}
    />
    <div>
      <div className="grid-container" style={{display:"flex"}}>
        <div className="grid-item" style={{display:"flex",flexDirection:"column"}}>
            Nazwa
          <input
            id="text"
            name="text"
            onChange={(event) => data.onChangeLabel(event, id)}
            value={data.label}
            placeholder="nazwa elementu"
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

export default CustomNodeKZN;
