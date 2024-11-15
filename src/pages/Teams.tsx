import { IoMdSettings } from "react-icons/io";
import { Button, Accordion, AccordionItem } from "@nextui-org/react";

export default function Teams() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex justify-between w-full max-w-md m-2 border-b-1">
          <div className="mr-2 sm:mr-4 md:mr-8 lg:mr-16">Teams</div>
          <Button isIconOnly variant="light">
            <IoMdSettings size={15} />
          </Button>
        </div>
        <div className="flex items-center justify-between w-full max-w-md">
          <Accordion selectionMode="multiple" isCompact>
            <AccordionItem
              key="team name"
              aria-label="Team Name"
              subtitle="Members: Member 1, Member 2"
              title="Team Name"
            >
              Team One
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
