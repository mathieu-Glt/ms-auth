
export interface RegisterInterface {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    role?: string;
}



  
export type loginInterface = Omit<
  RegisterInterface,
  'firstname' | 'lastname' | 'role'
>;  

