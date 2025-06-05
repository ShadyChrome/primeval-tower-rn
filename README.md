# Primeaval Tower RN - React Native Expo App with Supabase

A basic React Native Expo application with Supabase integration for authentication and user management.

## Features

- ✅ User Authentication (Sign Up / Sign In)
- ✅ User Profile Management
- ✅ Session Persistence with AsyncStorage
- ✅ Modern UI with React Native Elements
- ✅ TypeScript Support
- ✅ Cross-platform (iOS, Android, Web)

## Prerequisites

- Node.js (v18 or later)
- Expo CLI
- A Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd primeaval-tower-rn
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings > API
3. Copy your project URL and anon public key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Alternatively, you can directly update the values in `lib/supabase.ts`:

```typescript
const supabaseUrl = 'your_supabase_project_url'
const supabaseAnonKey = 'your_supabase_anon_key'
```

### 4. Set up Database Schema

In your Supabase dashboard, run the following SQL to create the profiles table:

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, updated_at)
  values (new.id, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Run the Application

```bash
npx expo start
```

Then:
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Press `w` to run on web
- Or scan the QR code with Expo Go app on your mobile device

## Project Structure

```
primeaval-tower-rn/
├── components/
│   ├── Auth.tsx          # Authentication component
│   └── Account.tsx       # User account management
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── App.tsx               # Main app component
└── README.md
```

## Key Dependencies

- **@supabase/supabase-js**: Supabase JavaScript client
- **@react-native-async-storage/async-storage**: Local storage for session persistence
- **@rneui/themed**: UI components library
- **react-native-url-polyfill**: URL polyfill for React Native
- **react-native-vector-icons**: Icon library

## Usage

### Authentication

The app provides a simple authentication flow:

1. **Sign Up**: Users can create a new account with email and password
2. **Sign In**: Existing users can sign in with their credentials
3. **Email Verification**: New users receive an email verification link

### Profile Management

Once authenticated, users can:

- View their profile information
- Update their username and website
- Sign out from the application

### Session Management

- Sessions are automatically persisted using AsyncStorage
- The app automatically refreshes tokens when active
- Authentication state is managed globally

## Customization

### Styling

The app uses React Native Elements for UI components. You can customize the theme by:

1. Installing additional theme packages: `npm install @rneui/base @rneui/themed`
2. Creating a custom theme configuration
3. Wrapping your app with the ThemeProvider

### Adding Features

To extend the app, consider adding:

- Avatar upload functionality
- Real-time features with Supabase Realtime
- Social authentication (Google, GitHub, etc.)
- Data synchronization
- Push notifications

## Environment Variables

The following environment variables can be configured:

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**: Make sure your Supabase credentials are correct
2. **Network errors**: Check your internet connection and Supabase project status
3. **Build errors**: Ensure all dependencies are properly installed

### Development Tips

- Use Expo DevTools for debugging
- Check Supabase dashboard for authentication logs
- Enable RLS policies for proper data security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Elements](https://reactnativeelements.com/)
- [React Native Documentation](https://reactnative.dev/) 