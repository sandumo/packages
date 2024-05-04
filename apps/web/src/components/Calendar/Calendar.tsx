import { Box, IconButton } from '@mui/material';

// import { OrganizationSchedule } from 'api-client';
import { range } from 'utils';
import datetime from 'datetime';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { Button, Typography } from '@components';
import { useState } from 'react';

// import { JobInterview } from 'api-client/src/modules/job';

type CalendarProps = {

  startDate: string;
  availabilitySchedules: any[];
  interviews: any[];
}

const height = 1000;
const lineColor = '#EFEFEF';

export default function Calendar({
  // startDate,
  availabilitySchedules,
  interviews,
}: CalendarProps) {
  const startHour = 4;
  const endHour = 16;

  const numberOfSeconds = (endHour - startHour) * 60 * 60;

  const [startDate, setStartDate] = useState(datetime().startOfWeek().toDateFormat());

  const weekdays = range(0, 7).map((i) => datetime(startDate).add(i, 'days').format('YYYY-MM-DD'));

  // console.log('[x] weekdays', startDate, weekdays, availabilitySchedules);

  return (
    <Box sx={{ mb: -12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
        <Box>
          <IconButton size="small" color="primary" onClick={() => setStartDate(datetime(startDate).subtract(7, 'days').toDateFormat())}>
            <KeyboardArrowLeftRoundedIcon fontSize="large" />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => setStartDate(datetime(startDate).add(7, 'days').toDateFormat())}>
            <KeyboardArrowRightRoundedIcon fontSize="large" />
          </IconButton>
        </Box>
        <Box sx={{ fontWeight: 700, fontSize: 20, ml: 4, width: 180 }}>
          {datetime(weekdays[0]).format('MM') === datetime(weekdays[weekdays.length - 1]).format('MM') ? (
            datetime(weekdays[0]).format('MMM YYYY')
          ) : (
            datetime(weekdays[0]).format('MMM') + ' - ' + datetime(weekdays[weekdays.length - 1]).format('MMM YYYY')
          )}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box>
          <Button variant="contained">Adaugă disponibilitate</Button>
        </Box>
      </Box>

      {/* Weekdays */}
      <Box sx={{
        bgcolor: '#fff',
        position: 'absolute',
        width: 'calc(100% - 56px - 32px)',
        pl: 4,
        mb: -4,
        zIndex: 999,
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: 12,
          pb: 3,
          borderBottom: `1px solid ${lineColor}`,
        }}>
          {weekdays.map((weekday, index) => (
            <Box
              key={weekday}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: datetime(weekday).toDateFormat() === datetime().toDateFormat() ? 'primary.main' : 'text.primary',
              }}>
              <Box>{datetime(weekday).format('ddd')}</Box>
              <Box sx={{ fontWeight: 700, fontSize: 16 }}>{datetime(weekday).format('DD')}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Calendar grid */}
      <Box sx={{ height: 'calc(100vh - 165px)', overflowY: 'scroll' }}>
        <Box sx={{
          position: 'relative',
          height,
          mt: 13.5,
          ml: 4,
        }}>
          {/* Draw horizontal lines */}
          <Box sx={{
            position: 'absolute',
            left: -3,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            '& > div': {
              borderBottom: `1px solid ${lineColor}`,
              position: 'relative',
              '& > div': {
                position: 'absolute',
                fontSize: 10,
                color: '#00000070',
                right: 'calc(100% + 1px)',
                top: -6.1,
                textAlign: 'right',
              },
            },
          }}>
            {range(startHour, endHour + 1).map((hour, index) => (
              <div key={hour}>
                <div>{index > 0 && `${hour}`.padStart(2, '0')}</div>
              </div>
            ))}
          </Box>

          {/* Draw vertical lines */}
          <Box sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -8,
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            '& > div': {
              borderLeft: `1px solid ${lineColor}`,
              height: '100%',
            },
          }}>
            {range(0, weekdays.length + 1).map(label => (
              <div key={label}>

              </div>
            ))}
          </Box>

          {/* Schedules */}
          {availabilitySchedules.map((schedule, index) => weekdays.map((weekday, index) => datetime(weekday).isBetween(datetime(schedule.startDatetime).toDateFormat(), datetime(schedule.repeatEndDate || schedule.endDatetime).toDateFormat()) && (
            <Box
              key={schedule.id + '.' + weekday}
              sx={{
                position: 'absolute',
                borderRadius: .5,
                fontSize: 12,
                ml: '1px',
                py: .5,
                px: 1,
                color: 'success.main',
                bgcolor: theme => `${theme.palette.success.main}30`,
                width: 'calc(100% / 7 - 10px)',
                top: height * datetime(schedule.startDatetime).diff(datetime(`${datetime(schedule.startDatetime).toDateFormat()} ${`${startHour}`.padStart(2, '0')}:00:00`), 's') / numberOfSeconds,
                height: height * (datetime(schedule.endDatetime).diff(datetime(schedule.endDatetime).startOf('day'), 's') / numberOfSeconds - datetime(schedule.startDatetime).diff(datetime(schedule.startDatetime).startOf('day'), 's') / numberOfSeconds),
                left: 'calc(100% / 7 * ' + datetime(weekday).diff(weekdays[0], 'day') + ' - 1px)',
                cursor: 'pointer',
              }}
            >
              Disponibil
            </Box>
          )))}

          {/* Interviews */}
          {interviews.filter(interview => datetime(interview.startDatetime).isBetween(weekdays[0], weekdays[weekdays.length - 1])).map((interview, index) => (
            <Box
              key={interview.id}
              sx={{
                position: 'absolute',
                borderRadius: .5,
                ml: '1px',
                py: .5,
                px: 1,
                bgcolor: theme => `${theme.palette.primary.main}`,
                width: 'calc(100% / 7 - 10px)',
                top: height * datetime(interview.startDatetime).diff(datetime(`${datetime(interview.startDatetime).toDateFormat()} ${`${startHour}`.padStart(2, '0')}:00:00`), 's') / numberOfSeconds,
                height: height * (datetime(interview.endDatetime).diff(datetime(interview.endDatetime).startOf('day'), 's') / numberOfSeconds - datetime(interview.startDatetime).diff(datetime(interview.startDatetime).startOf('day'), 's') / numberOfSeconds),
                left: 'calc(100% / 7 * ' + datetime(interview.startDatetime).diff(weekdays[0], 'day') + ' - 1px)',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 12 }}>{interview.applicant.displayName}</Typography>
              <Typography sx={{ fontWeight: 600, color: '#ffffffd0', fontSize: 10, mt: -.75 }}>{interview.job.title}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
