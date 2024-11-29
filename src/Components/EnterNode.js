import React from "react";
import { Handle, Position } from "reactflow";
import "./CustomNode.css";
const EnterNode = ({ data, id }) => (
  <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5 }}>
    <div>
      Wejście
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: "#555" }}
    />
  </div>
);

export default EnterNode;
