import cn from 'classnames';
import React from 'react';

import { useLabels } from '../../../../../../tedi/providers/label-provider';
import Button from '../../../../button/button';
import { LayoutContext } from '../../../layout-context';
import styles from './sidenav-toggle.module.scss';

export const SidenavToggle = () => {
  const {
    menuOpen: contextMenuOpen,
    reference,
    getReferenceProps,
    sideNavProps,
    onHeaderSidenavToggle,
  } = React.useContext(LayoutContext);
  const { getLabel } = useLabels();
  const [localMenuOpen, setLocalMenuOpen] = React.useState(false);
  const isCustomToggle = typeof onHeaderSidenavToggle === 'function';
  const menuOpen = isCustomToggle ? localMenuOpen : contextMenuOpen;
  const toggleLabel = getLabel('header.toggle');

  const BEM = cn(styles['sidenav-toggle'], { [styles['sidenav-toggle--open']]: menuOpen });

  if (!sideNavProps?.navItems.length && !onHeaderSidenavToggle) {
    return null;
  }

  const handleClick = () => {
    if (isCustomToggle) {
      setLocalMenuOpen((prev) => {
        const next = !prev;
        onHeaderSidenavToggle(next);
        return next;
      });
    }
  };

  const buttonProps = isCustomToggle ? { onClick: handleClick } : { ...getReferenceProps(), ref: reference };

  return (
    <Button
      {...buttonProps}
      icon={{
        name: menuOpen ? 'close' : 'menu',
        className: styles['sidenav-toggle__icon'],
      }}
      visualType="primary"
      className={BEM}
    >
      {typeof toggleLabel === 'string' ? toggleLabel : toggleLabel(menuOpen)}
    </Button>
  );
};

export default SidenavToggle;
