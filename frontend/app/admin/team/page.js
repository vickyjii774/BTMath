"use client";
import AdminContentManager from "../../../components/AdminContentManager";
const fields=[{name:"name",label:"Full name",type:"text",required:true},{name:"role",label:"Position / role",type:"text",required:true},{name:"bio",label:"Biography",type:"textarea"},{name:"image_url",label:"Profile image URL",type:"url"},{name:"email",label:"Public email",type:"email"},{name:"linkedin_url",label:"LinkedIn URL",type:"url"},{name:"order",label:"Display order",type:"number",defaultValue:1},{name:"is_active",label:"Show on website",type:"checkbox",defaultValue:true}];
export default function TeamAdminPage(){return <AdminContentManager resource="team-members" title="Our Team" description="Manage educator and team profiles shown on the public website." fields={fields}/>;}
