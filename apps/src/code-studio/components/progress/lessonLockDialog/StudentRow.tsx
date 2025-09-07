import React from 'react';

import {LockStatus} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import color from '@cdo/apps/util/color';

interface StudentRowProps {
  index: number;
  name: string;
  lockStatus: typeof LockStatus;
  handleRadioChange: (index: number, lockStatus: typeof LockStatus) => void;
}

const StudentRow = ({
  index,
  name,
  lockStatus,
  handleRadioChange,
}: StudentRowProps) => {
  const radioChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const modifiedIndex = parseInt(event.target.name, 10);
    const lockStatus = event.target.value as typeof LockStatus;
    handleRadioChange(modifiedIndex, lockStatus);
  };

  return (
    <tr>
      <td style={styles.tableCell}>{name}</td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Locked && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index.toString()}
          value={LockStatus.Locked}
          checked={lockStatus === LockStatus.Locked}
          onChange={radioChangeEvent}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.Editable && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index.toString()}
          value={LockStatus.Editable}
          checked={lockStatus === LockStatus.Editable}
          onChange={radioChangeEvent}
        />
      </td>
      <td
        style={{
          ...styles.tableCell,
          ...styles.radioCell,
          ...(lockStatus === LockStatus.ReadonlyAnswers && styles.selectedCell),
        }}
      >
        <input
          type="radio"
          name={index.toString()}
          value={LockStatus.ReadonlyAnswers}
          checked={lockStatus === LockStatus.ReadonlyAnswers}
          onChange={radioChangeEvent}
        />
      </td>
    </tr>
  );
};

const styles = {
  tableCell: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    padding: 10,
  },
  radioCell: {
    textAlign: 'center',
  },
  selectedCell: {
    backgroundColor: color.lightest_teal,
  },
} satisfies Record<string, React.CSSProperties>;

export default StudentRow;
