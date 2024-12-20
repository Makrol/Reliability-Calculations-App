import { Fragment, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import CustomNode from "./CustomNode";
import EnterNode from "./EnterNode";
import ExitNode from "./ExitNode";
import CustomNodeKZN from "./CustomNodeKZN";
import { type } from "@testing-library/user-event/dist/type";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";
let idS = 1;
const getIdSerial = () => `s_${idS++}`;
let idP = 1;
const getIdParaller = () => `p_${idP++}`;

const initialEdges = [
  {
    id: "reactflow__edge-enter-s_0",
    source: "enter",
    target: "s_0",
  },
  {
    id: "reactflow__edge-enter-p_0",
    source: "enter",
    target: "p_0",
  },
  {
    id: "reactflow__edge-s_0-exit",
    source: "s_0",
    target: "exit",
  },
  {
    id: "reactflow__edge-p_0-exit",
    source: "p_0",
    target: "exit",
  },
];
const customNodes = {
  customNodeKZN: (props) => <CustomNodeKZN {...props} />,
  enterNode: (props) => <EnterNode {...props} />,
  exitNode: (props) => <ExitNode {...props} />,
};

const KZNCard = () => {
  const diagramRef = useRef();
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
  const initialNodes = [
    {
      id: "enter",
      type: "enterNode",
      position: { x: 30, y: 250 },
    },
    {
      id: "exit",
      type: "exitNode",
      position: { x: 400, y: 250 },
    },
    {
      id: "s_0",
      type: "customNodeKZN",
      position: { x: 150, y: 230 },
      data: {
        label: "",
        onChangeLabel
      },
    },
    {
      id: "p_0",
      type: "customNodeKZN",
      position: { x: 150, y: 330 },
      data: {
        label: "",
        onChangeLabel
      },
    },
  ];
  const [finalValues,setFinalValues] = useState({
    kg:0,
    et:0,
    etn:0
  })
  const [TTime,setTTime] = useState(0);
  const [TnTime,setTnTime] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [lastSerialEdge, setLastSerialEdge] = useState(
    "reactflow__edge-s_0-exit"
  );
  const [lastParallerNode, setLastParallerNode] = useState("p_0");
  
  const addNodeParaller = () => {
    const node = nodes.find((e) => e.id == lastParallerNode);
    const newNode = {
      id: getIdParaller(),
      type: "customNodeKZN",
      position: { x: node.position.x, y: node.position.y + 100 },
      data: {
        label: "",
        onChangeLabel
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setLastParallerNode(newNode.id);

    const newEdgeFromEnter = {
      id: "reactflow__edge-enter-" + newNode.id,
      source: "enter",
      target: newNode.id,
    };
    const newEdgeToExit = {
      id: "reactflow__edge-" + newNode.id + "-exit",
      source: newNode.id,
      target: "exit",
    };
    setEdges((edge) => [...edge, newEdgeFromEnter, newEdgeToExit]);
  };
  const addNodeSerial = () => {
    debugger;
    const edge = edges.find((e) => e.id == lastSerialEdge);
    const node = nodes.find((e) => e.id == edge.source);
    const newNode = {
      id: getIdSerial(),
      type: "customNodeKZN",
      position: { x: node.position.x + 250, y: node.position.y },
      data: {
        label: "",
        onChangeLabel
      },
    };
    setNodes((nds) => [...nds, newNode]);

    const newEdgeToExit = {
      id: "reactflow__edge-" + newNode.id + "-exit",
      source: newNode.id,
      target: "exit",
    };

    const newEdgeToLast = {
      id: "reactflow__edge-" + edge.source + "-" + newNode.id,
      source: edge.source,
      target: newNode.id,
    };
    setLastSerialEdge(newEdgeToExit.id);
    setEdges((edge) => [...edge, newEdgeToExit, newEdgeToLast]);

    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.id !== lastSerialEdge)
    );

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === "exit"
          ? { ...n, position: { ...n.position, x: newNode.position.x+250 } }
          : n
      )
    );

    const enterN = nodes.find((e) => e.id == "enter");
    const exitN = nodes.find((e) => e.id == "exit");
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id.startsWith("p")
          ? {
              ...n,
              position: {
                ...n.position,
                x: (enterN.position.x + exitN.position.x) / 2,
              },
            }
          : n
      )
    );
  };
  const addEdge = () => {};

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const calculateFactorial = (num) => {
    if (num < 0) return "Nie istnieje"; // Silnia dla liczb ujemnych nie jest zdefiniowana
    let factorial = 1;
    for (let i = 1; i <= num; i++) {
        factorial *= i;
    }
    return factorial;
};
const calculateNewton = (n,k) =>{
  return calculateFactorial(n)/(calculateFactorial(k)*calculateFactorial(n-k))
}

  const onCalculate = () =>{
    debugger
    const k = nodes.filter(e => e.id.startsWith("s")).length;
    const n = nodes.length-2;

    const A = 1/TTime;
    const u =1/TnTime;

    setFinalValues(
      {
        kg:calculateKg(n,k,A,u),
        et:calculateEt(n,k,A,u),
        etn:calculateEtn(n,k,A,u)
      }
    )
    
  }
  const calculateKg = (n,k,A,u)=>{
    let value =0;
    for (let i = 0; i <= n-k; i++) {
      value+=(calculateFactorial(n)/(calculateFactorial(i)*calculateFactorial(n-i)))*Math.pow(A/u,i)
    }
    return Math.pow(u/(A+u),n)*value;
  }
  const calculateEt = (n,k,A,u)=>{
    let mathExp3 =0;
    debugger
    for (let i = 0; i <= n-k; i++) {
      mathExp3+=(calculateFactorial(n)/(calculateFactorial(i)*calculateFactorial(n-i)))*Math.pow(A/u,i)
    }
    let mathExp1 = 1/(calculateNewton(n,k)*k*A)
    let mathExp2 = Math.pow(u/A,n-k)
    return mathExp1*mathExp2*mathExp3
  }
  const calculateEtn = (n,k,A,u)=>{
    let mathExp2 = 0;
    for ( let i = 0; i <= k-1; i++) {
      mathExp2+=calculateNewton(n,k-i-1)*Math.pow(A/u,i)
    }
    const mathExp1 = 1/(calculateNewton(n,k)*k*u);

    return mathExp1*mathExp2
  }
  const saveToPDF = async() =>{ 
    onCalculate()
    const element = diagramRef.current;

    try {
      debugger
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("portrait", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgWidth = Math.min(pageWidth, 150);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imageX = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      pdf.text("Struktura k-z-n", 10, 20);
      pdf.addImage(imgData, "PNG", imageX, 30, imgWidth, imgHeight);

      const secondTableStartY = imgHeight + 30;
      pdf.text("Wyniki koncowe", 10, secondTableStartY);

      //debugger;
      autoTable(pdf, {
        startY: secondTableStartY + 5,
        head: [["Kg", "ET", "ETn"]],
        body: [[finalValues.kg, finalValues.et+"[h]", finalValues.etn+"[h]"]],
      });

      pdf.save("result.pdf");
    } catch (error) {
      console.error("Błąd podczas generowania PDF:", error);
    }
  }
  return (
    <Fragment>
      <div className="leftSection" ref={diagramRef}>
        <ReactFlowProvider>
          <div style={{ position: "absolute", right: 10, top: 10, zIndex: 10 }}>
            <button onClick={addNodeSerial}>Dodaj element szeregowy</button>
            <button onClick={addNodeParaller}>Dodaj element równoległy</button>
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
          <div className="container">
          <div>
              <div className="grid-item">
                <label htmlFor="text">
                  T
                </label>
              </div>
              <div className="grid-item">
                {" "}
                <input
                  id="text"
                  name="text"
                  onChange={(event) => {
                    if (event.target.value < 0) event.target.value = 0;
                    setTTime(event.target.value)
                  }}
                  value={TTime}
                  type="number"
                  min="0"
                  placeholder="średni czas pracy do awarii"
                />
              </div>
            </div>
            <div>
              <div className="grid-item">
                <label htmlFor="text">
                  T<sub>n</sub>
                </label>
              </div>
              <div className="grid-item">
                {" "}
                <input
                  id="text"
                  name="text"
                  onChange={(event) => {
                    if (event.target.value < 0) event.target.value = 0;
                    setTnTime(event.target.value)
                  }}
                  value={TnTime}
                  type="number"
                  min="0"
                  placeholder="średni czas naprawy"
                />
              </div>
            </div>
            <div className="calculationContainer">
              <div>
                K<sub>g</sub> = {finalValues.kg}
              </div>
              <div>ET = {finalValues.et} {"[h]"}</div>
              <div>ETn = {finalValues.etn} {"[h]"}</div>
            </div>
            <button onClick={onCalculate}>Oblicz</button>
            <button onClick={saveToPDF}>Oblicz i zapisz diagram do PDF</button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default KZNCard;
