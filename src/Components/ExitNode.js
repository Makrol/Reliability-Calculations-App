import React from "react";
import { Handle, Position } from "reactflow";
import "./CustomNode.css";
const ExitNode = ({ data, id }) => (
  <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5 }}>
    <div>
      Wyjście
    </div>
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: "#555" }}
    />
  </div>
);

export default ExitNode;
