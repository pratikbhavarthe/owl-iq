// This file maps the Python robot skills to JavaScript functions
// In a real implementation, these would make API calls to your robot control system

export interface RobotSkill {
    id: string
    name: string
    description: string
    parameters: {
      name: string
      type: "string" | "number" | "boolean"
      required: boolean
      default?: any
      description: string
    }[]
    execute: (params: Record<string, any>) => Promise<any>
  }
  
  export const robotSkills: RobotSkill[] = [
    {
      id: "get_joint",
      name: "Get Joint Values",
      description: "Returns the current joint values of the robot in radians",
      parameters: [
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description:
            "The robot number to use. Robot 1 will be the first IP address in the list, robot 2 will be the second IP address in the list and so on.",
        },
        {
          name: "wait",
          type: "boolean",
          required: false,
          default: true,
          description: "True will allow to return the latest data received from the robot.",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing get_joint with params:", params)
        return [0.1, 0.2, 0.3, 0.4, 0.5, 0.6] // Mock joint values
      },
    },
    {
      id: "get_position",
      name: "Get Position",
      description: "Returns the current pose of robot end effector",
      parameters: [
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "wait",
          type: "boolean",
          required: false,
          default: true,
          description: "True will allow to return the latest data received from the robot.",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing get_position with params:", params)
        return [0.5, 0.3, 0.7, 0, 0, 0] // Mock position values [x, y, z, rx, ry, rz]
      },
    },
    {
      id: "get_zone_pose",
      name: "Get Zone Pose",
      description: "Requests the pose of the robot at a particular zone",
      parameters: [
        {
          name: "zone_name",
          type: "string",
          required: true,
          description: "Target pose name where the robot needs to move.",
        },
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "joint_space",
          type: "boolean",
          required: false,
          default: false,
          description: "Boolean to decide whether to use joint space or cartesian space",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing get_zone_pose with params:", params)
  
        // Mock zone poses
        const zones: Record<string, number[]> = {
          home: [0, 0, 0, 0, 0, 0],
          pre_yellow_cuboid: [0.3, 0.2, 0.5, 0, 0, 0],
          yellow_cuboid: [0.3, 0.2, 0.1, 0, 0, 0],
        }
  
        return zones[params.zone_name] || null
      },
    },
    {
      id: "hand_teach_init",
      name: "Hand Teach Mode",
      description: "It switches the hand teach/gravity mode on or off based on the config bool value",
      parameters: [
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "config",
          type: "boolean",
          required: true,
          default: false,
          description:
            "The boolean which decides the robot is in gravity or hand teach mode or not. true puts the robot in hand teach and false switches the gravity/hand teach off",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing hand_teach_init with params:", params)
        return true // Mock success response
      },
    },
    {
      id: "control_gripper",
      name: "Control Gripper",
      description: "Activates/Deactivates the gripper",
      parameters: [
        {
          name: "switch",
          type: "boolean",
          required: true,
          description: "True to activate or close the gripper and False to deactivate or open the gripper.",
        },
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "model",
          type: "string",
          required: false,
          default: "robotiq",
          description: "The gripper model robot is using for applications",
        },
        {
          name: "span",
          type: "number",
          required: false,
          description: "The stroke length of the gripper to open if using robotiq gripper",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing control_gripper with params:", params)
        return true // Mock success response
      },
    },
    {
      id: "move_to_pose",
      name: "Move to Pose",
      description: "Requests the robot server to move to a specific pose",
      parameters: [
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "pose_name",
          type: "string",
          required: false,
          description: "The name of the zone/pose or position to where robot needs to go",
        },
        {
          name: "use_moveit",
          type: "boolean",
          required: false,
          default: false,
          description: "The boolean which checks if robot has to use moveit or not",
        },
        {
          name: "goal_pose",
          type: "string",
          required: false,
          description: "The goal pose as a list of coordinates",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing move_to_pose with params:", params)
        return true // Mock success response
      },
    },
    {
      id: "move_translate",
      name: "Move Translate",
      description: "Tool to translate or move the robot in a particular plane or axis",
      parameters: [
        {
          name: "robot_to_use",
          type: "number",
          required: true,
          default: 1,
          description: "The robot number to use",
        },
        {
          name: "x",
          type: "number",
          required: false,
          default: 0.0,
          description: "The distance in m to which robot needs to translate in x axis",
        },
        {
          name: "y",
          type: "number",
          required: false,
          default: 0.0,
          description: "The distance in m to which robot needs to translate in y axis",
        },
        {
          name: "z",
          type: "number",
          required: false,
          default: 0.0,
          description: "The distance in m to which robot needs to translate in z axis",
        },
        {
          name: "toolspeed",
          type: "number",
          required: false,
          default: 100,
          description: "The speed of robot when it executes the translation",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing move_translate with params:", params)
        return true // Mock success response
      },
    },
    {
      id: "delay",
      name: "Delay",
      description: "Adds delay in the script",
      parameters: [
        {
          name: "delay",
          type: "number",
          required: true,
          description: "Delay in seconds",
        },
      ],
      execute: async (params) => {
        // In a real implementation, this would call your robot API
        console.log("Executing delay with params:", params)
        await new Promise((resolve) => setTimeout(resolve, params.delay * 1000))
        return `Added delay for ${params.delay} seconds`
      },
    },
  ]
  
  // Function to get a skill by ID
  export function getSkillById(id: string): RobotSkill | undefined {
    return robotSkills.find((skill) => skill.id === id)
  }
  
  // Function to execute a skill with parameters
  export async function executeSkill(skillId: string, parameters: Record<string, any>): Promise<any> {
    const skill = getSkillById(skillId)
  
    if (!skill) {
      throw new Error(`Skill with ID ${skillId} not found`)
    }
  
    return await skill.execute(parameters)
  }
  