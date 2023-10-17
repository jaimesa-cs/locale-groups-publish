import { Accordion, Icon, Tooltip } from "@contentstack/venus-components";

import Environments from "@/app/components/sidebar/Environments";
import Locales from "@/app/components/sidebar/Locales";

interface SelectionsProps {}

const actions = [
  {
    component: (
      <Tooltip content="See all references" position="top" showArrow={false}>
        <Icon icon="Reference" size="tiny" />
      </Tooltip>
    ),
    onClick: () => {
      alert("Delete triggered");
    },
    actionClassName: "ActionListItem--warning",
  },
];

const Selections = ({}: SelectionsProps) => {
  return (
    <div className="grid grid-cols-1 divide-x">
      <div className="pb-5">
        <Accordion title={`Country Groups`} renderExpanded actions={actions}>
          <Locales />
        </Accordion>
      </div>
    </div>
  );
};

export default Selections;
