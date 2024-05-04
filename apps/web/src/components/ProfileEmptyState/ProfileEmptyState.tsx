import { ProfileEmpthyExperienceIcon, ProfileEmpthySkillIcon, ProfileEmpthyStudyIcon } from '@icons';
import { Box, Typography } from '@mui/material';

const ProfileEmptyState = ({ empthyText, icon }: any) => {
  return <Box sx={{ m: 4, backgroundColor: '#fff', mt: 3, mb: 3, textAlign: 'center', width: '100%', px: '20%' }}>

    {icon === '1' ? (<ProfileEmpthySkillIcon sx={{ fontSize: 100, color: '#E0E0E0' }}/>) : icon === '2' ? <ProfileEmpthyExperienceIcon sx={{ fontSize: 100, color: '#E0E0E0' }}/> : <ProfileEmpthyStudyIcon sx={{ fontSize: 100, color: '#E0E0E0' }}/>}
    <Typography sx={{ color: '#212121', lineHeight: '20px', fontWeight: 500 }}>{empthyText}</Typography>
  </Box>;
};

export default  ProfileEmptyState;
