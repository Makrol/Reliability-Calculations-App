import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";
import CustomNode from "./Components/CustomNode";

let id = 0;
const getId = () => `node_${id++}`;
const initialNodes = [];
const customNodes = {
  customNode: (props) => <CustomNode {...props} />,
};
const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [parallelNodesGroups, setParallelNodesGroups] = useState([]);
  const [kgn,setKgn] = useState([]);
  const [finalKgn,setFinalKgn] = useState(0);
  const [parallelEnterEnd , setParallelEnterEnd] = useState([]);

  // Dodawanie nowego węzła
  const addNode = () => {
    const newNode = {
      id: getId(),
      type: "customNode",
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: "",
        Ti: "",
        Tni: "",
        onChangeTi,
        onChangeTni,
        onChangeLabel
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  const calculateFinal = () => {
    setParallelEnterEnd([]);
    findGroup("node_0",0);
    setFinalKgn(afunction("node_0",1));
  };

  const onChangeTi = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, Ti: value } }
          : node
      )
    );
  };
  const onChangeLabel = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: value } }
          : node
      )
    );
  };
  const onChangeTni = (event, nodeId) => {
    const { value } = event.target;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, Tni: value } }
          : node
      )
    );
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const findParallelNodes = () => {
    const parallelNodes = [];
    nodes.forEach((node) => {
      let source=-1
      let counter = 0;
      const groupNodes = [];
      edges.forEach((edge) => {
        if (edge.source === node.id || edge.targer === node.id) {
          counter++;
          source=edge.source
          if (edge.source !== node.id) groupNodes.push(edge.source);
          else if (edge.target !== node.id) groupNodes.push(edge.target);
        }
      });
      if (counter > 1) {
        var num = 1;
        groupNodes.forEach((e)=>{
           num*= (1-kgn.find(kgnE=>kgnE.id===e).kgn);

        })
        parallelNodes.push({group:groupNodes,kgn:1-num,enter:source,exit:-1});
      }
    });
    return parallelNodes;
  };
  const findGroup = (nodeId,waitFor) =>{
    let enter;
    const branches = edges.filter(e=>e.source==nodeId)
    if(branches.length===1)
    {
      const joints = edges.filter(e=>e.target===branches[0].target);
      if(joints.length>1)
        return joints[0].target;
    }else if(branches.length>1)
    {
      waitFor+=1;
      enter = branches[0].source;
    }
    
    const jointGroup =[];
    branches.forEach(br=>{
      jointGroup.push(findGroup(br.target,waitFor+1));
    })
    let isJoint = true;
    jointGroup.forEach(j=>{
      if(j!==jointGroup[0])
      {
        isJoint=false;

        return nodeId
      }
    })
    if(isJoint)
    {
      if(enter!==undefined)
        parallelEnterEnd.push({enter:enter,end:jointGroup[0]})
      if(waitFor>0)
      {
        if(jointGroup[0]===undefined)
          return findGroup(nodeId,waitFor-1);
        else
          return findGroup(jointGroup[0],waitFor-1);
      }
        
    }
    return nodeId
  }
  const claculateKgn = () =>{
    const returnVal = [];
    nodes.forEach(node=>{
      const value = parseFloat(node.data.Ti)/(parseFloat(node.data.Ti)+parseFloat(node.data.Tni));
      returnVal.push({id:node.id,label:node.data.label,kgn:value,ti:node.data.Ti,tni:node.data.Tni}); 
    })
    return returnVal;
  }
  
  const afunction = (nodeId,stopOn) =>{
    const enterNode = parallelEnterEnd.find(p=>p.enter===nodeId);
    const nodeValue = kgn.find(e=>e.id===nodeId).kgn;
    if(enterNode)
    {
      let value = 1;
      const paths = edges.filter(e=>e.source===enterNode.enter);

      //równolegle
      paths.forEach((n)=>{
        value*=(1-afunction(n.target,enterNode.end));
      })
      value=1-value;
      //szeregowo
      if(stopOn===enterNode.end)
        return nodeValue*value
      else
      {
        //szeregowo
        return nodeValue*value*afunction(enterNode.end);
      }
    }
    else
    {
      const edge = edges.find(e=>e.source===nodeId);
      
      if(stopOn&&edge.target===stopOn)
      {
        return nodeValue
      }
      else if(edge)
      {
        //szeregowo
        return afunction(edge.target)*nodeValue;
      }
      return nodeValue;
    }
  }
  useEffect(() => {
    setParallelNodesGroups(findParallelNodes());
  }, [edges,nodes]);

  useEffect(()=>{
    setKgn(claculateKgn());
  },[nodes])

  return (
    <div className="App">
      <div className="leftSection">
        <ReactFlowProvider>
          <div style={{ position: "absolute", right: 10, top: 10, zIndex: 10 }}>
            <button onClick={addNode}>Dodaj</button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodes}
            fitView
          >
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <div className="rightSection">
        <div className="container">
          {kgn.map((v, k) => (
            <div key={v.id} className="calculationContainer">
              <div>Nazwa: {v.label}</div>
              <div>
                T<sub>{v.id.split("_")[1]}</sub>= {v.ti}
              </div>
              <div>
                T<sub>n{v.id.split("_")[1]}</sub>= {v.tni}
              </div>
              <div>
                K<sub>g{v.id.split("_")[1]}</sub> ={" "}
                {v.kgn}
              </div>
            </div>
          ))}
        </div>
        
        
        <div className="container">
          <div className="calculationContainer">
            K<sub>g</sub> = {finalKgn}
          </div>
          <button onClick={()=>calculateFinal()}>Oblicz</button>
        </div>
      </div>
    </div>
  );
};

export default App;
