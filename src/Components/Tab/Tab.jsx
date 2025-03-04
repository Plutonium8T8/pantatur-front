import { useState } from "react";
import "./Tab.css";
import { Button } from "../Button";

export const Tab = ({ currentTab, tabs, content, direction, headerContentSpacing }) => {
  const [activeTab, setActiveTab] = useState(currentTab || tabs[0].key);


  const flexDirection = {
    vertical: "column",
    horizontal: "row"
  }

  const tabsDirection = {
    vertical: "row",
    horizontal: "column"
  }

  return (
    <div className="tabs-wrapper" style={{"--direction": flexDirection[direction], "--spacing": `${headerContentSpacing}px`}}>
      <div  className="tabs-buttons" style={{"--tabs-direction": tabsDirection[direction]}}>
        {tabs.map((item) => (
          <Button
            onClick={() => setActiveTab(item.key)}
            variant={item.key === activeTab ? "primary" : "default"}
            key={item.key}
          >
            {item.title}
          </Button>
        ))}
      </div>
      <div className="tabs-wrapper-container">
      {content[activeTab]}
      </div>
    </div>
  );
};
