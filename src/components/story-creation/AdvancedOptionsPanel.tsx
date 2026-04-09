import React from "react";
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper,
  FormHelperText,
  Alert,
} from "@mui/material";
import { Shield } from "lucide-react";
import {
  AGE_BANDS,
  INTERESTS,
  TONES,
  LEARNING_GOALS,
  STORY_TYPES,
  STORY_LENGTHS,
  MOODS,
  LANGUAGES,
  INSTITUTION_SUBJECT_AREAS,
  INSTITUTION_SESSION_SETTINGS,
} from "../../types/storyOptions";

export interface InstitutionStoryContextFields {
  subjectArea: string;
  setSubjectArea: (v: string) => void;
  sessionSetting: string;
  setSessionSetting: (v: string) => void;
  teachingFocus: string;
  setTeachingFocus: (v: string) => void;
}

interface AdvancedOptionsPanelProps {
  mode: "home" | "institution" | null;
  institutionContext?: InstitutionStoryContextFields | null;
  childName: string;
  setChildName: (name: string) => void;
  ageBand: number | null;
  setAgeBand: (age: number | null) => void;
  interests: string[];
  setInterests: (interests: string[]) => void;
  tone: string;
  setTone: (tone: string) => void;
  learningGoal: string;
  setLearningGoal: (goal: string) => void;
  storyType: string;
  setStoryType: (type: string) => void;
  storyLength: "short" | "medium" | "long";
  setStoryLength: (length: "short" | "medium" | "long") => void;
  currentMood: string;
  setCurrentMood: (mood: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

export const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  mode,
  institutionContext,
  childName,
  setChildName,
  ageBand,
  setAgeBand,
  interests,
  setInterests,
  tone,
  setTone,
  learningGoal,
  setLearningGoal,
  storyType,
  setStoryType,
  storyLength,
  setStoryLength,
  currentMood,
  setCurrentMood,
  language,
  setLanguage,
}) => {
  const handleInterestToggle = (interest: string) => {
    setInterests(
      interests.includes(interest)
        ? interests.filter((i) => i !== interest)
        : [...interests, interest]
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {mode === "institution" ? "Classroom story setup" : "Story Preferences"}
          </Typography>

          <Typography variant="caption">
            🔒 <strong>Privacy first:</strong> these choices are only used for this session’s story prompt — they are not stored.
          </Typography>
        </Box>

        {mode === "institution" && institutionContext && (
          <>
            <Alert severity="info" sx={{ py: 0.75 }}>
              <strong>Institution mode:</strong> no individual child names. Set an{" "}
              <strong>age band</strong> (or type an age in your idea) so vocabulary and themes fit your
              group.
            </Alert>

            <FormControl fullWidth>
              <InputLabel id="inst-subject-label">Subject / unit focus</InputLabel>
              <Select
                labelId="inst-subject-label"
                value={institutionContext.subjectArea}
                label="Subject / unit focus"
                onChange={(e) => institutionContext.setSubjectArea(e.target.value)}
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {INSTITUTION_SUBJECT_AREAS.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Links the story to your lesson (e.g. science unit, literacy block).</FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="inst-session-label">Session setting</InputLabel>
              <Select
                labelId="inst-session-label"
                value={institutionContext.sessionSetting}
                label="Session setting"
                onChange={(e) => institutionContext.setSessionSetting(e.target.value)}
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {INSTITUTION_SESSION_SETTINGS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>How you&apos;ll share the story (whole class, small group, etc.).</FormHelperText>
            </FormControl>

            <TextField
              label="Teaching goal / curriculum note (optional)"
              value={institutionContext.teachingFocus}
              onChange={(e) => institutionContext.setTeachingFocus(e.target.value)}
              placeholder="e.g. vocabulary about habitats; practice listening for a problem and solution"
              multiline
              minRows={2}
              fullWidth
              helperText="Short note for the model — not stored after this session."
            />
          </>
        )}

        {/* Child Name (Home Mode Only) */}
        {mode === "home" && (
          <TextField
            label="Child Name (Optional)"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            helperText="Used to personalize the story. Optional."
            fullWidth
          />
        )}

        {/* Age Band - Optional */}
        <FormControl fullWidth>
          <InputLabel>Age Band (Optional)</InputLabel>
          <Select
            value={ageBand || ""}
            onChange={(e) => setAgeBand(Number(e.target.value) || null)}
            label="Age Band (Optional)"
          >
            <MenuItem value="">
              <em>Not specified</em>
            </MenuItem>
            {AGE_BANDS.map((band) => (
              <MenuItem key={band.value} value={band.value}>
                {band.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            <Shield size={12} style={{ display: "inline", verticalAlign: "middle" }} />
            {" "}Helps generate age-appropriate content, vocabulary, and themes
          </FormHelperText>
        </FormControl>

        {/* Interests */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Interests & Themes
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {INTERESTS.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onClick={() => handleInterestToggle(interest)}
                color={interests.includes(interest) ? "primary" : "default"}
                variant={interests.includes(interest) ? "filled" : "outlined"}
                sx={{
                  fontWeight: interests.includes(interest) ? 600 : 400,
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 1,
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Tone */}
        <FormControl fullWidth>
          <InputLabel>Tone</InputLabel>
          <Select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            label="Tone"
          >
            <MenuItem value="">
              <em>Any tone</em>
            </MenuItem>
            {TONES.map((toneOption) => (
              <MenuItem key={toneOption} value={toneOption}>
                {toneOption}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            The emotional style of the story
          </FormHelperText>
        </FormControl>

        {/* Learning Goal */}
        <FormControl fullWidth>
          <InputLabel>Learning Goal</InputLabel>
          <Select
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
            label="Learning Goal"
          >
            {LEARNING_GOALS.map((goal) => (
              <MenuItem key={goal} value={goal}>
                {goal}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            What should the child learn or focus on?
          </FormHelperText>
        </FormControl>

        {/* Story Type */}
        <FormControl fullWidth>
          <InputLabel>Story Type</InputLabel>
          <Select
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
            label="Story Type"
          >
            <MenuItem value="">
              <em>Any type</em>
            </MenuItem>
            {STORY_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            The genre or context of the story
          </FormHelperText>
        </FormControl>

        {/* Story Length */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Story Length
          </Typography>
          <ToggleButtonGroup
            value={storyLength}
            exclusive
            onChange={(_, newLength) => {
              if (newLength) setStoryLength(newLength);
            }}
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                py: 1.5,
                textTransform: "none",
                fontWeight: 500,
              },
            }}
          >
            {STORY_LENGTHS.map((length) => (
              <ToggleButton key={length.value} value={length.value}>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {length.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {length.duration}
                  </Typography>
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Current Mood (Optional) */}
        <FormControl fullWidth>
          <InputLabel>Current Mood (Optional)</InputLabel>
          <Select
            value={currentMood}
            onChange={(e) => setCurrentMood(e.target.value)}
            label="Current Mood (Optional)"
          >
            <MenuItem value="">
              <em>Not specified</em>
            </MenuItem>
            {MOODS.map((mood) => (
              <MenuItem key={mood} value={mood}>
                {mood}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            How is the child feeling right now?
          </FormHelperText>
        </FormControl>

        {/* Language/Accent (Optional - Future TTS) */}
        <FormControl fullWidth>
          <InputLabel>Language (Optional)</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            label="Language (Optional)"
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            For future text-to-speech features
          </FormHelperText>
        </FormControl>
      </Stack>
    </Paper>
  );
};
