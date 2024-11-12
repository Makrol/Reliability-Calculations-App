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
  const [parallelEnterEnd , setParallelEnterEnd] = useState([]);

  // Dodawanie nowego węzła
  const addNode = () => {
    const newNode = {
      id: getId(),
      type: "customNode",
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        label: `Node ${id}`,
        Ti: "",
        Tni: "",
        onChangeTi,
        onChangeTni,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  const showNode = () => {
    setParallelEnterEnd([]);
    findGroup("node_0",0);
    console.log(afunction("node_0",1));
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
           num*= kgn.find(kgnE=>kgnE.id===e).kgn;

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
      returnVal.push({id:node.id,kgn:value,ti:node.data.Ti,tni:node.data.Tni}); 
    })
    return returnVal;
  }
  
  const afunction = (nodeId,stopOn) =>{
    const enterNode = parallelEnterEnd.find(p=>p.enter===nodeId);
    if(enterNode)
    {
      const node = nodes.find(n=>n.id===nodeId);
      let value = 1;
      const paths = edges.filter(e=>e.source===enterNode.enter);

      paths.forEach((n)=>{
        value*=afunction(n.target,enterNode.end);
      })
      if(stopOn===enterNode.end)
        return parseFloat(node.data.Tni)+value
      else
        return parseFloat(node.data.Tni)+value+afunction(enterNode.end);
    }
    else
    {
      const edge = edges.find(e=>e.source===nodeId);
      const node = nodes.find(n=>n.id===nodeId);
      if(stopOn&&edge.target===stopOn)
      {
        return parseFloat(node.data.Tni)
      }
      else if(edge)
        return afunction(edge.target)+parseFloat(node.data.Tni);
      return parseFloat(node.data.Tni);
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
            <button onClick={addNode}>Add Node</button>
            <button onClick={showNode}>Show Node</button>
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
        Wszystkie
        <div className="container">
          {kgn.map((v, k) => (
            <div key={v.id} className="calculationContainer">
              <div>
                T<sub>{k + 1}</sub>= {v.ti}
              </div>
              <div>
                T<sub>n{k + 1}</sub>= {v.tni}
              </div>
              <div>
                K<sub>g{k + 1}</sub> ={" "}
                {v.kgn}
              </div>
            </div>
          ))}
        </div>
        Równoległe
        <div className="container">
          {parallelNodesGroups.map((element, keyGroup) => {
            return(
              <div className="calculationContainer">
                {
                  element.group.map((node, keyNode) => {
                    const nodeData = kgn.find((n) => n.id === node);
                    return (
                      <div
                        key={`${keyGroup}-${keyNode}`}
                      >
                        K<sub>g{keyNode + 1}</sub> ={" "}
                        {nodeData.kgn}
                      </div>
                    );
                  })
                }
                K<sub>g</sub>= {element.kgn}
                
              </div>
            ) 
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
