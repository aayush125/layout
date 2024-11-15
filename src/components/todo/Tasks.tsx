import { Tabs, Tab } from "@nextui-org/react";

export default function Tasks() {
  return (
    <>
      <Tabs>
        <Tab key="today" title="Today"></Tab>
        <Tab key="pending" title="Pending"></Tab>
        <Tab key="overdue" title="Overdue"></Tab>
      </Tabs>
    </>
  );
}
