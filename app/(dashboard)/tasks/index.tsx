import { Redirect } from 'expo-router';

export default function TasksIndex() {
  return <Redirect href="/(dashboard)/tasks/home" />;
}