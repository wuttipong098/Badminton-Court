import { getDbConnection } from '@/repository/db_connection';
import { registerB } from '@/repository/entity/registerBS';
import bcrypt from 'bcrypt';

// Export a named handler for PUT method
export const PUT = async (req: Request) => {
  try {
    const body = await req.json();
    const { FirstName, LastName, UserName, Password, PhoneNumber, Province, District, CourtLocation, RoleName, StadiumName } = body;

    if (!FirstName || !LastName || !UserName || !Password || !PhoneNumber || !CourtLocation || !RoleName) {
      return new Response(JSON.stringify({ status_code: 400, status_message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const location = `${CourtLocation} ${Province} ${District}`;

    await getDbConnection(async (manager) => {
      const newRegister = new registerB();
      newRegister.first_name = FirstName;
      newRegister.last_name = LastName;
      newRegister.user_name = UserName;
      newRegister.password = hashedPassword;
      newRegister.phone_number = PhoneNumber;
      newRegister.location = location;
      newRegister.role_name = RoleName;
      newRegister.stadium_name = StadiumName;

      await manager.save(newRegister);
    });

    return new Response(JSON.stringify({ status_code: 200, status_message: 'Registration successful' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return new Response(JSON.stringify({ status_code: 500, status_message: 'Internal server error' }), {
      status: 500,
    });
  }
};